/**
 * Generic documentation crawler.
 * All settings come from environment variables — no hardcoded site specifics.
 *
 * CRAWL_MODE=crawl (default):
 *   Required: DOCS_BASE_URL, DOCS_SECTIONS (JSON array of path slugs)
 *   Optional: CONTENT_SELECTOR, NEXT_BUTTON_SELECTOR, AUTH_TYPE, AUTH_EMAIL, AUTH_PASSWORD
 *
 * CRAWL_MODE=url:
 *   Required: URL_FETCH_URLS (JSON array of full URLs)
 *   Optional: URL_FETCH_SELECTOR (CSS selector; blank = smart auto-detect)
 *   No auth needed — public pages only.
 *
 * CRAWL_MODE=prelogin:
 *   Opens headed browser for manual SSO login; saves session to user_data/.
 *
 * Common optional: DATA_DIR, DOCS_DIR
 */

require('dotenv').config({ path: process.env.DOTENV_PATH || require('path').resolve(__dirname, '../../.env') });

const fs     = require('fs');
const path   = require('path');
const crypto = require('crypto');
const { chromium } = require('playwright');

// ── Config from env ────────────────────────────────────────────────────────
const CRAWL_MODE        = (process.env.CRAWL_MODE || 'crawl').toLowerCase();
const LOGIN_TIMEOUT_MS  = parseInt(process.env.LOGIN_TIMEOUT_MS || '300000'); // 5 min default
const INCREMENTAL_CRAWL = process.argv.includes('--incremental');

const BASE_URL = process.env.DOCS_BASE_URL;
if (!BASE_URL && CRAWL_MODE !== 'prelogin' && CRAWL_MODE !== 'url') {
  console.error('DOCS_BASE_URL is not set. Cannot start.');
  process.exit(1);
}

let ITEMS = [];
if (CRAWL_MODE !== 'prelogin' && CRAWL_MODE !== 'url') {
  try {
    ITEMS = JSON.parse(process.env.DOCS_SECTIONS || '[]');
  } catch (_) {
    console.error('DOCS_SECTIONS is not valid JSON. Expected a JSON array of path slugs.');
    process.exit(1);
  }
  if (!ITEMS.length) {
    console.error('DOCS_SECTIONS is empty. Add at least one section slug.');
    process.exit(1);
  }
}

const CONTENT_SELECTOR      = process.env.CONTENT_SELECTOR      || '#main-content';
const NEXT_BUTTON_SELECTOR  = process.env.NEXT_BUTTON_SELECTOR  || '.article-next';
const AUTH_TYPE             = (process.env.AUTH_TYPE || 'none').toLowerCase();

// URL-fetch mode settings
let URL_FETCH_GROUPS = [];
let URL_FETCH_URLS   = [];
if (CRAWL_MODE === 'url') {
  try { URL_FETCH_GROUPS = JSON.parse(process.env.URL_FETCH_GROUPS || '[]'); } catch (_) {}
  try { URL_FETCH_URLS   = JSON.parse(process.env.URL_FETCH_URLS   || '[]'); } catch (_) {}
  const hasGroups = Array.isArray(URL_FETCH_GROUPS) && URL_FETCH_GROUPS.length > 0;
  const hasUrls   = Array.isArray(URL_FETCH_URLS)   && URL_FETCH_URLS.length   > 0;
  if (!hasGroups && !hasUrls) {
    console.error('Neither URL_FETCH_GROUPS nor URL_FETCH_URLS is set. Provide at least one URL.');
    process.exit(1);
  }
  // Legacy flat-list: promote to a single default group
  if (!hasGroups && hasUrls) {
    URL_FETCH_GROUPS = [{ name: 'web-pages', urls: URL_FETCH_URLS }];
  }
}
const URL_FETCH_SELECTOR = process.env.URL_FETCH_SELECTOR || '';

// ── Paths ──────────────────────────────────────────────────────────────────
const DATA_DIR       = process.env.DATA_DIR || path.resolve(process.cwd(), './data');
const APP_ROOT       = path.dirname(DATA_DIR);
const DOCS_DIR       = process.env.DOCS_DIR || path.join(APP_ROOT, 'docs');
const USER_DATA_DIR  = path.join(APP_ROOT, 'user_data');
const MANIFEST_PATH  = path.join(DOCS_DIR, 'manifest.json');
const LOG_PATH       = path.join(DOCS_DIR, 'crawl.log');
const HASHES_PATH    = path.join(DATA_DIR, 'crawl_hashes.json');

function loadCrawlHashes() {
  try { if (fs.existsSync(HASHES_PATH)) return JSON.parse(fs.readFileSync(HASHES_PATH, 'utf8')); } catch (_) {}
  return {};
}

function md5(str) {
  return crypto.createHash('md5').update(str).digest('hex');
}

function sanitizeSection(name) {
  return String(name || '').toLowerCase().replace(/[^a-z0-9_-]/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);
}

// ── Logger ─────────────────────────────────────────────────────────────────
let logStream;

function initLogStream() {
  fs.mkdirSync(DOCS_DIR, { recursive: true });
  fs.writeFileSync(LOG_PATH, '=== Crawl started ' + new Date().toISOString() + ' ===\n');
  logStream = fs.createWriteStream(LOG_PATH, { flags: 'a' });
}

function ts() {
  return new Date().toISOString().replace('T', ' ').slice(0, 23);
}

function log(level, ...args) {
  const prefix = { INFO:'  ', OK:'✅', WARN:'⚠️ ', ERROR:'❌', SKIP:'⏭️ ', HEAD:'📦', DONE:'🎉' }[level] || '  ';
  const msg  = args.join(' ');
  const line = '[' + ts() + '] [' + level + '] ' + msg;
  console.log(prefix + ' ' + msg);
  if (logStream) logStream.write(line + '\n');
}

// ── Helpers ────────────────────────────────────────────────────────────────
function safeFilename(title) {
  return title.replace(/[^\w\s]/gi, '').replace(/\s+/g, '-').toLowerCase().slice(0, 80);
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

// ── Smart content extraction (URL mode + portal fallback) ─────────────────
async function smartExtractContent(page) {
  const CANDIDATES = [
    'article', 'main', '[role="main"]', '#main-content', '#content',
    '.content', '.documentation', '.post-content', '.article-body',
    '.entry-content', '.markdown-body', '#readme', '.docs-content',
    '.page-content', '.article-content', '.doc-content',
  ];
  for (const sel of CANDIDATES) {
    try {
      const text = await page.$eval(sel, el => el.innerText);
      if (text && text.trim().length > 300) {
        return await page.$eval(sel, el => el.innerHTML);
      }
    } catch (_) {}
  }
  // Fallback: full body minus navigation chrome
  return page.evaluate(() => {
    const clone = document.body.cloneNode(true);
    clone.querySelectorAll(
      'nav, header, footer, aside, script, style, noscript, iframe,' +
      ' .nav, .navbar, .sidebar, .cookie-notice, .cookie-banner,' +
      ' [role="banner"], [role="navigation"], [role="contentinfo"], [role="complementary"]'
    ).forEach(el => el.remove());
    return clone.innerHTML;
  });
}

// ── Auth ───────────────────────────────────────────────────────────────────
async function loginIfNeeded(page) {
  if (AUTH_TYPE === 'none') return;

  // 'browser' type uses a pre-cached session from the pre-login flow.
  // If the session is valid, the content will already be there.
  if (AUTH_TYPE === 'browser') {
    try {
      const el = await page.$(CONTENT_SELECTOR);
      if (el) { log('OK', 'Pre-cached session active — skipping login'); return; }
      log('WARN', 'Session not detected. Did you complete the pre-login step?');
    } catch (_) {}
    return;
  }

  try {
    const el = await page.$(CONTENT_SELECTOR);
    if (el) { log('OK', 'Session active — skipping login'); return; }
  } catch (_) {}

  if (AUTH_TYPE === 'microsoft') {
    await loginMicrosoft(page);
  } else {
    await loginForm(page);
  }
}

async function loginForm(page) {
  log('INFO', 'Logging in (form auth)...');
  try {
    await page.waitForSelector('input[type="email"]', { timeout: 15000 });
    await page.fill('input[type="email"]', process.env.AUTH_EMAIL || '');
    await page.click('input[type="submit"]');

    await page.waitForSelector('input[type="password"]', { timeout: 10000 });
    await page.fill('input[type="password"]', process.env.AUTH_PASSWORD || '');
    await page.click('input[type="submit"]');
    log('OK', 'Login submitted — waiting for portal...');

    await page.waitForSelector(CONTENT_SELECTOR, { timeout: 30000 });
    log('OK', 'Login successful');
  } catch (err) {
    log('ERROR', 'Login error: ' + err.message);
    throw err;
  }
}

async function loginMicrosoft(page) {
  log('INFO', 'Logging in via Microsoft...');
  try {
    await page.waitForSelector('input[type="email"]', { timeout: 15000 });
    await page.fill('input[type="email"]', process.env.AUTH_EMAIL || '');
    await page.click('input[type="submit"]');
    log('INFO', 'Email submitted');

    await page.waitForSelector('input[type="password"]', { timeout: 10000 });
    await page.fill('input[type="password"]', process.env.AUTH_PASSWORD || '');
    await page.click('input[type="submit"]');
    log('INFO', 'Password submitted');
  } catch (err) {
    log('ERROR', 'Login form error: ' + err.message);
    throw err;
  }

  // "Stay signed in?" prompt — optional
  try {
    await page.waitForSelector('#idSIButton9', { timeout: 5000 });
    await page.click('#idSIButton9');
    log('INFO', '"Stay signed in" accepted');
  } catch (_) {}

  // Wait for the portal content — this naturally blocks while user completes MFA/OTP/push/call
  const timeoutMin = (LOGIN_TIMEOUT_MS / 60000).toFixed(0);
  log('INFO', 'Waiting up to ' + timeoutMin + ' min for authentication to complete...');
  log('INFO', 'If prompted for MFA (OTP / push notification / phone call), complete it now in the browser window.');
  await page.waitForSelector(CONTENT_SELECTOR, { timeout: LOGIN_TIMEOUT_MS });
  log('OK', 'Authentication successful');
}

// ── Wait for content to stabilise ─────────────────────────────────────────
async function waitForStableContent(page, section, pageIndex) {
  const MAX_POLLS   = 12;
  const POLL_MS     = 600;
  const MAX_RETRIES = 3;

  for (let retry = 0; retry < MAX_RETRIES; retry++) {
    if (retry > 0) {
      log('WARN', '[' + section + ' #' + pageIndex + '] Content retry ' + retry + '/3 — reloading page');
      await page.reload({ waitUntil: 'networkidle' });
      await page.waitForTimeout(1000);
    }

    let prev = '', stable = '';
    for (let poll = 0; poll < MAX_POLLS; poll++) {
      try {
        await page.waitForSelector(CONTENT_SELECTOR, { timeout: 6000 });
        const html = await page.$eval(CONTENT_SELECTOR, el => el.innerHTML);
        if (html && html.length > 100) {
          if (html === prev) { stable = html; break; }
          prev = html;
        }
      } catch (err) {
        log('WARN', '[' + section + ' #' + pageIndex + '] Poll ' + (poll+1) + ' error: ' + err.message);
      }
      await page.waitForTimeout(POLL_MS);
    }

    if (stable && stable.length > 100) return stable;
    log('WARN', '[' + section + ' #' + pageIndex + '] Content not stable after ' + MAX_POLLS + ' polls');
  }

  throw new Error('Could not extract stable content after ' + MAX_RETRIES + ' retries');
}

// ── Safe next-button navigation ────────────────────────────────────────────
async function clickNextAndWait(page) {
  const hasNext = await page.evaluate(
    (sel) => !!document.querySelector(sel),
    NEXT_BUTTON_SELECTOR
  );
  if (!hasNext) return false;

  const currentUrl = page.url();
  log('INFO', 'Clicking next button → waiting for navigation');

  try {
    await page.evaluate(
      (sel) => { const btn = document.querySelector(sel); if (btn) btn.click(); },
      NEXT_BUTTON_SELECTOR
    );
  } catch (clickErr) {
    log('WARN', 'evaluate click failed: ' + clickErr.message + ' — trying locator click');
    try {
      await page.locator(NEXT_BUTTON_SELECTOR).click({ timeout: 5000 });
    } catch (fallbackErr) {
      log('ERROR', 'All click strategies failed: ' + fallbackErr.message);
      return null;
    }
  }

  try {
    await page.waitForFunction(
      (prev) => window.location.href !== prev,
      currentUrl,
      { timeout: 10000 }
    );
    await page.waitForTimeout(400);
    log('INFO', 'Navigated to: ' + page.url());
    return true;
  } catch (_) {
    log('WARN', 'URL did not change after click — may still be on same page');
    return true;
  }
}

// ── Crawl one section ──────────────────────────────────────────────────────
async function crawlSection(page, item, manifest, crawlHashes, newHashes) {
  log('HEAD', 'Section: ' + item);

  const sectionDir = path.join(DOCS_DIR, item);
  ensureDir(sectionDir);

  const startUrl = BASE_URL + '/' + item;
  try {
    await page.goto(startUrl, { waitUntil: 'networkidle', timeout: 30000 });
  } catch (navErr) {
    log('ERROR', 'Could not load section start URL ' + startUrl + ': ' + navErr.message);
    return;
  }

  await loginIfNeeded(page);

  let pageIndex    = 1;
  let skipped      = 0;
  let saved        = 0;
  const visitedTitles = new Set();
  const visitedURLs   = new Set();

  while (true) {
    const currentUrl = page.url();

    if (visitedURLs.has(currentUrl)) {
      log('SKIP', 'URL already visited: ' + currentUrl + ' — ending section');
      break;
    }
    visitedURLs.add(currentUrl);

    log('INFO', '[' + item + ' #' + pageIndex + '] URL: ' + currentUrl);

    let html;
    try {
      html = await waitForStableContent(page, item, pageIndex);
    } catch (contentErr) {
      log('SKIP', '[' + item + ' #' + pageIndex + '] Skipping page — content error: ' + contentErr.message);
      manifest.push({ section: item, index: pageIndex, url: currentUrl, status: 'skipped', reason: contentErr.message, crawledAt: new Date().toISOString() });
      skipped++;
      pageIndex++;
      const advanced = await clickNextAndWait(page).catch(() => null);
      if (!advanced) break;
      continue;
    }

    let title = 'untitled';
    try { title = await page.title(); } catch (_) {}

    const safeTitle = safeFilename(title);
    if (visitedTitles.has(safeTitle)) {
      log('SKIP', '[' + item + '] Duplicate title "' + safeTitle + '" — section complete');
      break;
    }

    const prefix    = String(pageIndex).padStart(3, '0');
    const filename  = prefix + '_' + safeTitle + '.html';
    const filePath  = path.join(sectionDir, filename);
    const fileKey   = item + '/' + filename;
    const htmlHash  = md5(html);

    if (INCREMENTAL_CRAWL && crawlHashes[fileKey] === htmlHash && fs.existsSync(filePath)) {
      log('SKIP', '[' + item + ' #' + pageIndex + '] Unchanged: ' + filename);
      newHashes[fileKey] = htmlHash;
      manifest.push({ section: item, index: pageIndex, title, url: currentUrl, file: fileKey, status: 'unchanged', crawledAt: new Date().toISOString() });
    } else {
      try {
        fs.writeFileSync(filePath, html, 'utf8');
        log('OK', '[' + item + ' #' + pageIndex + '] Saved: ' + filename + ' (' + title + ')');
      } catch (writeErr) {
        log('ERROR', '[' + item + ' #' + pageIndex + '] Write failed: ' + writeErr.message);
      }
      newHashes[fileKey] = htmlHash;
      manifest.push({ section: item, index: pageIndex, title, url: currentUrl, file: fileKey, status: 'ok', crawledAt: new Date().toISOString() });
    }
    visitedTitles.add(safeTitle);
    saved++;
    pageIndex++;

    let advanced;
    try {
      advanced = await clickNextAndWait(page);
    } catch (navErr) {
      log('ERROR', '[' + item + ' #' + pageIndex + '] Navigation error: ' + navErr.message);
      break;
    }

    if (advanced === false) {
      log('DONE', '[' + item + '] End of section (' + saved + ' saved, ' + skipped + ' skipped)');
      break;
    }
    if (advanced === null) {
      log('WARN', '[' + item + '] Could not click next — ending section');
      break;
    }
  }

  log('INFO', '[' + item + '] Section complete: ' + saved + ' pages saved, ' + skipped + ' skipped');
}

// ── Pre-login mode (open browser for manual login, save session, exit) ─────
async function doPrelogin() {
  ensureDir(USER_DATA_DIR);
  initLogStream();

  const timeoutMin = (LOGIN_TIMEOUT_MS / 60000).toFixed(0);
  log('INFO', 'Pre-login mode — opening browser for manual login');
  log('INFO', 'Portal: ' + BASE_URL);
  log('INFO', 'Waiting up to ' + timeoutMin + ' minutes for login to complete...');

  // Remove stale Chromium lock file from a previous session that wasn't closed cleanly
  const lockFile = path.join(USER_DATA_DIR, 'SingletonLock');
  try { if (fs.existsSync(lockFile)) { fs.unlinkSync(lockFile); log('INFO', 'Cleared stale browser lock file'); } } catch (_) {}

  let preloginBrowser = null;

  process.on('SIGINT',  async () => { if (preloginBrowser) await preloginBrowser.close().catch(() => {}); process.exit(1); });
  process.on('SIGTERM', async () => { if (preloginBrowser) await preloginBrowser.close().catch(() => {}); process.exit(1); });

  preloginBrowser = await chromium.launchPersistentContext(USER_DATA_DIR, {
    headless: false,
    args: ['--start-maximized'],
  });

  const page = await preloginBrowser.newPage();

  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  log('INFO', 'Browser opened — log in now. Window closes automatically once detected.');

  await page.waitForSelector(CONTENT_SELECTOR, { timeout: LOGIN_TIMEOUT_MS });
  log('OK', 'Login detected — session saved in user_data/');
  log('OK', 'You can now proceed with the build.');

  if (logStream) logStream.end();
  await preloginBrowser.close();
}

// ── Main crawl ─────────────────────────────────────────────────────────────
async function main() {
  ensureDir(USER_DATA_DIR);
  ensureDir(DOCS_DIR);
  initLogStream();

  log('INFO', 'Portal: ' + BASE_URL);
  log('INFO', 'Sections: ' + ITEMS.join(', '));
  log('INFO', 'Auth: ' + AUTH_TYPE);
  log('INFO', 'Content selector: ' + CONTENT_SELECTOR);
  log('INFO', 'Next button: ' + NEXT_BUTTON_SELECTOR);

  // Headless unless Microsoft (needs visible window for MFA/OTP)
  const isHeadless = AUTH_TYPE !== 'microsoft';
  let browser = null;
  const manifest = [];
  let shuttingDown = false;

  // Register signal handlers early — before any async work — so signals during
  // browser launch don't cause a silent exit with code null.
  async function shutdown(signal) {
    if (shuttingDown) return;
    shuttingDown = true;
    log('WARN', signal + ' received — saving partial manifest and exiting');
    try { fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2), 'utf8'); } catch (_) {}
    log('OK', 'Partial manifest saved (' + manifest.length + ' entries)');
    if (browser) await browser.close().catch(() => {});
    process.exit(0);
  }
  process.on('SIGINT',  () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));

  browser = await chromium.launchPersistentContext(USER_DATA_DIR, {
    headless: isHeadless,
  });

  const page = await browser.newPage();

  const crawlHashes = INCREMENTAL_CRAWL ? loadCrawlHashes() : {};
  const newHashes   = {};

  if (INCREMENTAL_CRAWL) {
    log('INFO', 'Incremental mode — unchanged pages will be skipped');
  }

  for (const item of ITEMS) {
    if (shuttingDown) break;
    try {
      await crawlSection(page, item, manifest, crawlHashes, newHashes);
    } catch (sectionErr) {
      log('ERROR', 'Section "' + item + '" failed fatally: ' + sectionErr.message);
      log('INFO', 'Continuing to next section...');
    }
  }

  const okCount        = manifest.filter(m => m.status === 'ok').length;
  const skipCount      = manifest.filter(m => m.status === 'skipped').length;
  const unchangedCount = manifest.filter(m => m.status === 'unchanged').length;

  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2), 'utf8');
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(HASHES_PATH, JSON.stringify(newHashes, null, 2), 'utf8');

  log('DONE', 'Manifest written → ' + MANIFEST_PATH);
  log('INFO', 'Total: ' + okCount + ' pages saved, ' + skipCount + ' skipped' + (unchangedCount ? ', ' + unchangedCount + ' unchanged' : ''));
  log('DONE', 'Crawl complete');
  if (logStream) logStream.end();
  await browser.close();
}

// ── URL-fetch mode: fetch grouped URLs, each group saved to its own section ──
async function fetchUrls() {
  ensureDir(DOCS_DIR);
  initLogStream();

  const lockFile = path.join(USER_DATA_DIR, 'SingletonLock');
  try { if (fs.existsSync(lockFile)) fs.unlinkSync(lockFile); } catch (_) {}

  // Resolve section names and detect duplicates (auto-suffix rather than crash)
  const seenNames = {};
  const resolvedGroups = URL_FETCH_GROUPS.map((group, idx) => {
    let name = sanitizeSection(group.name) || (idx === 0 ? 'web-pages' : 'group-' + idx);
    if (seenNames[name] !== undefined) {
      seenNames[name]++;
      name = name + '-' + seenNames[name];
      log('WARN', 'Duplicate section name resolved to "' + name + '"');
    } else {
      seenNames[name] = 0;
    }
    return { name, urls: group.urls || [] };
  });

  const totalUrls = resolvedGroups.reduce((sum, g) => sum + g.urls.length, 0);
  log('INFO', 'URL-fetch mode — ' + totalUrls + ' page(s) across ' + resolvedGroups.length + ' section(s)');
  if (URL_FETCH_SELECTOR) log('INFO', 'Content selector: ' + URL_FETCH_SELECTOR);
  else                    log('INFO', 'Content selector: auto-detect');

  let browser = null;
  const manifest = [];
  let savedCount  = 0;
  let failedCount = 0;

  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.setExtraHTTPHeaders({ 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' });

    for (const group of resolvedGroups) {
      const sectionName = group.name;
      const sectionDir  = path.join(DOCS_DIR, sectionName);
      ensureDir(sectionDir);
      log('INFO', 'Section "' + sectionName + '" — ' + group.urls.length + ' URL(s)');

      for (let i = 0; i < group.urls.length; i++) {
        const url = group.urls[i];
        log('INFO', '[' + (i + 1) + '/' + group.urls.length + '] Fetching: ' + url);

        try {
          await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
          await page.waitForTimeout(1500);

          const title = await page.title().catch(() => url);

          let html;
          if (URL_FETCH_SELECTOR) {
            try {
              html = await page.$eval(URL_FETCH_SELECTOR, el => el.innerHTML);
              if (!html || html.trim().length < 100) {
                log('WARN', 'Selector "' + URL_FETCH_SELECTOR + '" returned too little content — falling back to smart detect');
                html = await smartExtractContent(page);
              }
            } catch (_) {
              log('WARN', 'Selector "' + URL_FETCH_SELECTOR + '" not found — using smart detect');
              html = await smartExtractContent(page);
            }
          } else {
            html = await smartExtractContent(page);
          }

          const slug  = url.replace(/https?:\/\//i, '').replace(/[^a-z0-9]+/gi, '_').slice(0, 60);
          const fname = String(i + 1).padStart(3, '0') + '_' + slug + '.html';
          const fpath = path.join(sectionDir, fname);
          const safeTitle = title.replace(/[<>"]/g, '');

          fs.writeFileSync(fpath, [
            '<html><head>',
            '<title>' + safeTitle + '</title>',
            '<meta name="source-url" content="' + url + '">',
            '</head><body>',
            html,
            '</body></html>',
          ].join(''), 'utf8');

          log('OK', 'Saved: ' + fname + ' (' + safeTitle + ')');
          manifest.push({ section: sectionName, index: i + 1, title: safeTitle, url, file: sectionName + '/' + fname, status: 'ok', crawledAt: new Date().toISOString() });
          savedCount++;
        } catch (err) {
          log('ERROR', 'Failed to fetch ' + url + ': ' + err.message);
          manifest.push({ section: sectionName, index: i + 1, url, status: 'skipped', reason: err.message, crawledAt: new Date().toISOString() });
          failedCount++;
        }
      }
    }
  } finally {
    if (browser) await browser.close().catch(() => {});
  }

  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2), 'utf8');
  log('DONE', 'Fetched ' + savedCount + ' page(s)' + (failedCount ? ', ' + failedCount + ' failed' : '') + ' across ' + resolvedGroups.length + ' section(s)');
  if (logStream) logStream.end();
}

// ── Entry point ────────────────────────────────────────────────────────────
if      (CRAWL_MODE === 'prelogin') doPrelogin().catch(err => { console.error('Pre-login failed:', err.message); process.exit(1); });
else if (CRAWL_MODE === 'url')      fetchUrls().catch(err  => { console.error('Fatal fetch error:', err.message); process.exit(1); });
else                                main().catch(err       => { console.error('Fatal crawl error:', err.message); process.exit(1); });
