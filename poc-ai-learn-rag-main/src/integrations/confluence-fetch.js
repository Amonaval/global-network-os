#!/usr/bin/env node
'use strict';

/**
 * Confluence fetch script — downloads all pages from configured Confluence spaces
 * and saves them as HTML files to docs/confluence-<spacekey>/.
 * The existing ingest.js pipeline picks them up unchanged.
 *
 * Usage: node src/integrations/confluence-fetch.js [--incremental]
 * All config comes from environment variables (set by server.js via configToEnv).
 */

const fs     = require('fs');
const path   = require('path');
const crypto = require('crypto');

const { ConfluenceClient } = require('./confluence');

const DOCS_DIR     = process.env.DOCS_DIR    || './docs';
const DATA_DIR     = process.env.DATA_DIR    || './data';
const HASH_FILE    = path.join(DATA_DIR, 'confluence_hashes.json');
const SPACES_FILE  = path.join(DATA_DIR, 'confluence_spaces.json');
const INCREMENTAL  = process.argv.includes('--incremental');

function md5(str) {
  return crypto.createHash('md5').update(str, 'utf8').digest('hex');
}

function loadHashes() {
  try { return JSON.parse(fs.readFileSync(HASH_FILE, 'utf8')); } catch (_) { return {}; }
}

function readJsonSafe(filePath, fallback = {}) {
  try { return JSON.parse(fs.readFileSync(filePath, 'utf8')); } catch (_) { return fallback; }
}

// Build page-id → breadcrumb string from flat page list using parentId links
function buildBreadcrumbs(pages) {
  const byId = {};
  for (const p of pages) byId[p.id] = p;

  function ancestors(pageId, depth = 0) {
    if (depth > 20) return [];  // cycle guard
    const p = byId[pageId];
    if (!p || !p.parentId || !byId[p.parentId]) return [];
    return [...ancestors(p.parentId, depth + 1), byId[p.parentId].title];
  }

  const result = {};
  for (const p of pages) {
    const ancs = ancestors(p.id);
    result[p.id] = { breadcrumb: [...ancs, p.title].join(' > '), depth: ancs.length };
  }
  return result;
}

// ── Confluence Storage Format → Markdown ─────────────────────────────────

function _strip(html) {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function storageToMd(xml) {
  if (!xml || xml.trim().replace(/[‌\s]/g, '') === '') return '';
  let md = xml;
  // 1. Strip Confluence macros
  md = md.replace(/<ac:structured-macro[^>]*>/g, '').replace(/<\/ac:structured-macro>/g, '');
  md = md.replace(/<ac:parameter[^>]*>[^<]*<\/ac:parameter>/g, '');
  // 2. Extract CDATA code blocks from ac:plain-text-body
  md = md.replace(/<ac:plain-text-body><!\[CDATA\[([\s\S]*?)\]\]><\/ac:plain-text-body>/g, '\n```\n$1\n```\n');
  // 3. Strip rich-text-body wrappers
  md = md.replace(/<ac:rich-text-body>/g, '').replace(/<\/ac:rich-text-body>/g, '');
  // 4. Convert ac:link with ri:url to plain URL
  md = md.replace(/<ac:link[^>]*><ri:url[^>]*ri:value="([^"]*)"[^>]*\/><\/ac:link>/g, '$1');
  // 5. Convert ri:page content-title to readable text
  md = md.replace(/<ri:page[^>]*ri:content-title="([^"]*)"[^>]*\/>/g, '$1');
  // 6. Headings h1-h4
  md = md.replace(/<h([1-4])[^>]*>([\s\S]*?)<\/h\1>/g, (_, n, t) => '\n' + '#'.repeat(n) + ' ' + _strip(t) + '\n');
  // 7. Tables → pipe-delimited markdown (columns padded to equal count)
  md = md.replace(/<table[^>]*>([\s\S]*?)<\/table>/g, (_, tb) => {
    const rows = [];
    (tb.match(/<tr[^>]*>([\s\S]*?)<\/tr>/g) || []).forEach(r => {
      const cells = (r.match(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/g) || [])
        .map(c => _strip(c.replace(/<[^>]+>/g, ' ')).replace(/\|/g, '\\|').replace(/\n/g, ' '));
      if (cells.length) rows.push(cells);
    });
    if (!rows.length) return '';
    const cols = Math.max(...rows.map(r => r.length));
    const pad  = rows.map(r => { while (r.length < cols) r.push(''); return r; });
    return '\n' + [
      '| ' + pad[0].join(' | ') + ' |',
      '| ' + pad[0].map(() => '---').join(' | ') + ' |',
      ...pad.slice(1).map(r => '| ' + r.join(' | ') + ' |'),
    ].join('\n') + '\n';
  });
  // 8. Lists
  md = md.replace(/<ul[^>]*>([\s\S]*?)<\/ul>/g, c => c.replace(/<li[^>]*>([\s\S]*?)<\/li>/g, (_, t) => '• ' + _strip(t) + '\n'));
  md = md.replace(/<ol[^>]*>([\s\S]*?)<\/ol>/g, c => { let n = 1; return c.replace(/<li[^>]*>([\s\S]*?)<\/li>/g, (_, t) => (n++) + '. ' + _strip(t) + '\n'); });
  // 9. Code blocks
  md = md.replace(/<code[^>]*>([\s\S]*?)<\/code>/g, '`$1`');
  md = md.replace(/<pre[^>]*>([\s\S]*?)<\/pre>/g, '\n```\n$1\n```\n');
  // 10. Bold
  md = md.replace(/<strong[^>]*>([\s\S]*?)<\/strong>/g, '**$1**');
  md = md.replace(/<b[^>]*>([\s\S]*?)<\/b>/g, '**$1**');
  // 11. Links — [text](url) only if text differs from URL
  md = md.replace(/<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/g, (_, h, t) => { const tx = _strip(t); return tx === h ? h : '[' + tx + '](' + h + ')'; });
  // 12. Block elements
  md = md.replace(/<br\s*\/?>/g, '\n');
  md = md.replace(/<p[^>]*>([\s\S]*?)<\/p>/g, (_, t) => '\n' + _strip(t) + '\n');
  md = md.replace(/<div[^>]*>([\s\S]*?)<\/div>/g, '\n$1\n');
  // 13. Horizontal rule
  md = md.replace(/<hr[^>]*\/?>/g, '\n---\n');
  // 14. Strip any remaining tags
  md = md.replace(/<[^>]+>/g, '');
  // 15. HTML entity decoding
  md = md
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ')
    .replace(/&#8204;/g, '');
  // 16. Collapse excess newlines, trim
  return md.replace(/\n{4,}/g, '\n\n\n').trim();
}

function parseSpaces() {
  const raw = process.env.CONFLUENCE_SPACES || '';
  // May be a JSON array string or comma/space separated list
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.map(s => String(s).trim()).filter(Boolean);
  } catch (_) {}
  return raw.split(/[\s,]+/).map(s => s.trim()).filter(Boolean);
}

async function main() {
  const authMethod  = process.env.CONFLUENCE_AUTH_METHOD || 'apitoken';
  const spaceKeys   = parseSpaces();

  console.log('Source       : Confluence');
  console.log('Auth method  : ' + authMethod);
  console.log('Space filter : ' + (spaceKeys.length ? spaceKeys.join(', ') : 'all spaces'));
  console.log('Mode         : ' + (INCREMENTAL ? 'incremental' : 'full'));
  console.log('');

  const client = new ConfluenceClient({
    authMethod,
    url:         process.env.CONFLUENCE_URL,
    email:       process.env.CONFLUENCE_EMAIL,
    apiToken:    process.env.CONFLUENCE_API_TOKEN,
    accessToken: process.env.CONFLUENCE_ACCESS_TOKEN,
    cloudId:     process.env.CONFLUENCE_CLOUD_ID,
  });

  console.log('Connecting to Confluence…');
  let allSpaces;
  try {
    allSpaces = await client.getSpaces();
  } catch (err) {
    console.error('Connection failed: ' + err.message);
    process.exit(1);
  }
  console.log('Found ' + allSpaces.length + ' space(s).');

  const spaces = spaceKeys.length
    ? allSpaces.filter(s => spaceKeys.map(k => k.toUpperCase()).includes(s.key.toUpperCase()))
    : allSpaces;

  if (!spaces.length) {
    const available = allSpaces.map(s => s.key).join(', ') || '(none accessible)';
    console.error('No matching spaces. Available: ' + available);
    process.exit(1);
  }

  fs.mkdirSync(DOCS_DIR, { recursive: true });
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const hashes    = INCREMENTAL ? loadHashes() : {};
  const newHashes = {};
  const manifest  = [];
  let totalSaved  = 0;
  let totalSkipped = 0;
  const baseUrl   = (process.env.CONFLUENCE_URL || '').replace(/\/+$/, '');

  // Write space name → key mapping so /api/sections can resolve display names
  const spacesMeta = readJsonSafe(SPACES_FILE, {});

  for (const space of spaces) {
    const sectionName = 'confluence-' + space.key.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const sectionDir  = path.join(DOCS_DIR, sectionName);
    fs.mkdirSync(sectionDir, { recursive: true });

    console.log('\n── Space: ' + space.name + ' (' + space.key + ') ──');
    let pages;
    try {
      pages = await client.getPagesInSpace(space.id);
    } catch (err) {
      console.error('  Failed to fetch pages: ' + err.message);
      continue;
    }
    console.log('  ' + pages.length + ' page(s) found');

    // Record space name for display in UI
    spacesMeta[space.key] = space.name;

    // Build breadcrumbs from parentId hierarchy
    const breadcrumbMap = buildBreadcrumbs(pages);

    for (let i = 0; i < pages.length; i++) {
      const page       = pages[i];
      const storageXml = (page.body && page.body.storage && page.body.storage.value) || '';
      const mdContent  = storageToMd(storageXml);

      const slug     = page.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'page-' + page.id;
      const filename = String(i + 1).padStart(3, '0') + '_' + slug + '.md';
      const filepath = path.join(sectionDir, filename);
      const fileKey  = sectionName + '/' + filename;
      const hash     = md5(storageXml);  // hash original XML for incremental detection
      const pageUrl  = baseUrl + '/wiki/spaces/' + space.key + '/pages/' + page.id;
      const bc       = breadcrumbMap[page.id] || { breadcrumb: page.title, depth: 0 };

      newHashes[fileKey] = hash;

      const entry = {
        section:    sectionName,
        index:      i + 1,
        title:      page.title,
        url:        pageUrl,
        file:       fileKey,
        pageId:     page.id,
        spaceKey:   space.key,
        spaceName:  space.name,
        breadcrumb: bc.breadcrumb,
        depth:      bc.depth,
        updatedAt:  page.version?.createdAt || '',
        crawledAt:  new Date().toISOString(),
      };

      if (INCREMENTAL && hashes[fileKey] === hash && fs.existsSync(filepath)) {
        totalSkipped++;
        entry.status = 'unchanged';
      } else {
        fs.writeFileSync(filepath, mdContent, 'utf8');
        totalSaved++;
        entry.status = 'ok';
      }

      manifest.push(entry);

      if ((i + 1) % 20 === 0) {
        console.log('  ' + (i + 1) + '/' + pages.length + ' pages fetched');
      }
    }

    console.log('  Done: ' + totalSaved + ' saved, ' + totalSkipped + ' unchanged');
  }

  // Persist hashes
  fs.mkdirSync(path.dirname(HASH_FILE), { recursive: true });
  fs.writeFileSync(HASH_FILE, JSON.stringify(newHashes, null, 2), 'utf8');

  // Persist space key → display name mapping
  fs.writeFileSync(SPACES_FILE, JSON.stringify(spacesMeta, null, 2), 'utf8');
  console.log('\nSpace names saved: ' + Object.keys(spacesMeta).join(', '));

  // Merge into manifest.json (keep non-Confluence entries)
  const manifestPath = path.join(DOCS_DIR, 'manifest.json');
  let existing = [];
  try { existing = JSON.parse(fs.readFileSync(manifestPath, 'utf8')); } catch (_) {}
  const nonConfluence = existing.filter(e => !String(e.section).startsWith('confluence-'));
  fs.writeFileSync(manifestPath, JSON.stringify([...nonConfluence, ...manifest], null, 2), 'utf8');

  console.log('\n──────────────────────────────────────────');
  console.log('Saved  : ' + totalSaved);
  console.log('Skipped: ' + totalSkipped);
  console.log('Total  : ' + manifest.length + ' pages');
}

main().catch(err => {
  console.error('\nERROR: ' + err.message);
  process.exit(1);
});
