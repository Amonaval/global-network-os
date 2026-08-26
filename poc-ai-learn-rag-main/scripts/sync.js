/**
 * sync.js — Incremental re-crawl + re-ingest using saved app config.
 *
 * Reads data/app_config.json (written by the setup wizard), converts it to
 * the env vars that crawl.js and ingest.js expect, then runs both scripts
 * incrementally so only changed pages are re-fetched and re-embedded.
 *
 * Usage:
 *   node scripts/sync.js               -- incremental (default)
 *   node scripts/sync.js --force       -- full rebuild (wipes index)
 */

const { spawn }   = require('child_process');
const path        = require('path');
const { readConfig, configToEnv } = require('../src/config/config');

const FORCE = process.argv.includes('--force');

function run(cmd, args, env) {
  return new Promise((resolve) => {
    const child = spawn(cmd, args, { env, stdio: 'inherit', shell: false });
    child.on('close', resolve);
  });
}

(async () => {
  // ── Load config ─────────────────────────────────────────────────────────────
  let cfg;
  try {
    cfg = readConfig();
  } catch (err) {
    console.error('\n❌  Could not read app config: ' + err.message);
    console.error('   Run the setup wizard first: npm run server → http://localhost:3000/setup\n');
    process.exit(1);
  }

  if (!cfg.portal?.baseUrl) {
    console.error('\n❌  No portal URL found in config.');
    console.error('   Complete the setup wizard first: npm run server → http://localhost:3000/setup\n');
    process.exit(1);
  }

  const childEnv = { ...process.env, ...configToEnv(cfg) };

  console.log('\nKnowledge Hub — Sync');
  console.log('Portal  : ' + cfg.portal.baseUrl);
  console.log('Sections: ' + (cfg.portal.sections || []).join(', '));
  console.log('Mode    : ' + (FORCE ? 'full rebuild (--force)' : 'incremental') + '\n');

  // ── Phase 1: Crawl ──────────────────────────────────────────────────────────
  console.log('── Phase 1/2: Crawling ──────────────────────────────');
  const crawlArgs   = [path.resolve(__dirname, '../src/crawler/crawl.js')];
  if (!FORCE) crawlArgs.push('--incremental');

  const crawlCode = await run('node', crawlArgs, childEnv);
  if (crawlCode !== 0) {
    console.error('\n❌  Crawl failed (exit code ' + crawlCode + '). See output above.\n');
    process.exit(crawlCode);
  }

  // ── Phase 2: Ingest ─────────────────────────────────────────────────────────
  console.log('\n── Phase 2/2: Ingesting ─────────────────────────────');
  const ingestArgs  = [path.resolve(__dirname, '../src/ingestion/ingest.js')];
  if (FORCE) {
    ingestArgs.push('--force');
  } else {
    ingestArgs.push('--incremental');
  }

  const ingestCode = await run('node', ingestArgs, childEnv);
  if (ingestCode !== 0) {
    console.error('\n❌  Ingest failed (exit code ' + ingestCode + '). See output above.\n');
    process.exit(ingestCode);
  }

  console.log('\n✅  Sync complete.\n');
})();
