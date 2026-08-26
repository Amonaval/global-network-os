'use strict';

/**
 * License management module.
 * Handles tier definitions, key activation, usage tracking, and feature gating.
 *
 * Cloud validation: set LICENSE_API_URL env var to point at your license server.
 * Without it, any correctly-formatted key is accepted (offline/dev mode).
 *
 * Key format: XXXX-XXXX-XXXX-XXXX (alphanumeric, case-insensitive)
 * Key prefixes (offline mode): LTM- / LIFE- → lifetime, everything else → pro
 */

const fs     = require('fs');
const path   = require('path');
const crypto = require('crypto');
const os     = require('os');

// ── Tier definitions ─────────────────────────────────────────────────────────
const TIERS = {
  free: {
    name:             'Free',
    queriesPerMonth:  200,
    uploadLimit:      515,
    confluenceAccess: false,
    analyticsAccess:  false,
    color:            '#6b7280',
  },
  pro: {
    name:             'Pro',
    queriesPerMonth:  -1,
    uploadLimit:      -1,
    confluenceAccess: true,
    analyticsAccess:  true,
    color:            '#6366f1',
  },
  lifetime: {
    name:             'Lifetime',
    queriesPerMonth:  -1,
    uploadLimit:      -1,
    confluenceAccess: true,
    analyticsAccess:  true,
    color:            '#f59e0b',
  },
};

// ── Storage paths ─────────────────────────────────────────────────────────────
function getDataDir() {
  return process.env.DATA_DIR || path.resolve(process.cwd(), './data');
}
function getLicensePath()  { return path.join(getDataDir(), 'license.json'); }
function getMachineIdPath(){ return path.join(getDataDir(), 'machine_id.txt'); }

// ── Machine fingerprint ───────────────────────────────────────────────────────
function getMachineId() {
  const p = getMachineIdPath();
  if (fs.existsSync(p)) return fs.readFileSync(p, 'utf8').trim();
  const raw = os.hostname() + '|' + os.platform() + '|' + ((os.cpus()[0] || {}).model || '');
  const id  = crypto.createHash('sha256').update(raw).digest('hex').slice(0, 32);
  try { fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, id); } catch (_) {}
  return id;
}

// ── License file I/O ──────────────────────────────────────────────────────────
function readLicense() {
  const p = getLicensePath();
  if (!fs.existsSync(p)) return { tier: 'free', key: null, activatedAt: null, expiry: null };
  try   { return JSON.parse(fs.readFileSync(p, 'utf8')); }
  catch (_) { return { tier: 'free', key: null, activatedAt: null, expiry: null }; }
}

function writeLicense(data) {
  fs.mkdirSync(path.dirname(getLicensePath()), { recursive: true });
  fs.writeFileSync(getLicensePath(), JSON.stringify(data, null, 2));
}

function deactivateLicense() {
  try { fs.unlinkSync(getLicensePath()); } catch (_) {}
}

function isExpired(license) {
  if (!license || !license.expiry) return false;
  return new Date(license.expiry) < new Date();
}

// ── Effective tier ─────────────────────────────────────────────────────────────
function getEffectiveTier() {
  const lic = readLicense();
  if (!lic.key || isExpired(lic)) return 'free';
  return TIERS[lic.tier] ? lic.tier : 'free';
}

function getTierInfo(tier) {
  return TIERS[tier] || TIERS.free;
}

// ── Usage tracking ─────────────────────────────────────────────────────────────
let _queryCountCache = { count: 0, month: '', ts: 0 };
const QUERY_CACHE_TTL_MS = 60_000;

function getMonthlyQueryCount() {
  const yyyymm = new Date().toISOString().slice(0, 7);
  const now    = Date.now();
  if (_queryCountCache.month === yyyymm && (now - _queryCountCache.ts) < QUERY_CACHE_TTL_MS) {
    return _queryCountCache.count;
  }
  const evalPath = path.join(getDataDir(), 'eval.jsonl');
  let count = 0;
  if (fs.existsSync(evalPath)) {
    try {
      for (const line of fs.readFileSync(evalPath, 'utf8').split('\n')) {
        if (!line.trim()) continue;
        try { const e = JSON.parse(line); if (e.ts && e.ts.startsWith(yyyymm)) count++; } catch (_) {}
      }
    } catch (_) {}
  }
  _queryCountCache = { count, month: yyyymm, ts: now };
  return count;
}

function getUploadCount() {
  const p = path.join(getDataDir(), 'upload_index.json');
  if (!fs.existsSync(p)) return 0;
  try { return JSON.parse(fs.readFileSync(p, 'utf8')).length; }
  catch (_) { return 0; }
}

// ── Query gate ────────────────────────────────────────────────────────────────
function checkQueryGate() {
  const tier  = getEffectiveTier();
  const info  = getTierInfo(tier);
  const limit = info.queriesPerMonth;
  if (limit === -1) return { allowed: true, remaining: -1, limit, tier };
  const used      = getMonthlyQueryCount();
  const remaining = Math.max(0, limit - used);
  return { allowed: remaining > 0, remaining, limit, used, tier };
}

// ── Upload gate ───────────────────────────────────────────────────────────────
function checkUploadGate() {
  const tier  = getEffectiveTier();
  const info  = getTierInfo(tier);
  const limit = info.uploadLimit;
  if (limit === -1) return { allowed: true, remaining: -1, limit, tier };
  const used      = getUploadCount();
  const remaining = Math.max(0, limit - used);
  return { allowed: remaining > 0, remaining, limit, used, tier };
}

// ── License activation ─────────────────────────────────────────────────────────
const KEY_REGEX = /^[A-Z0-9]{3,10}(-[A-Z0-9]{3,10}){2,4}$/i;

function detectTierFromKey(key) {
  const u = key.toUpperCase();
  if (u.startsWith('LTM-') || u.startsWith('LIFE-')) return 'lifetime';
  return 'pro';
}

async function activateLicense(key) {
  if (!key || !KEY_REGEX.test(key.trim())) {
    return { ok: false, error: 'Invalid key format. Expected: XXXX-XXXX-XXXX-XXXX' };
  }

  const cleanKey  = key.trim().toUpperCase();
  const apiUrl    = process.env.LICENSE_API_URL;
  const machineId = getMachineId();

  if (apiUrl) {
    try {
      const nodeFetch = require('node-fetch');
      const r = await nodeFetch(apiUrl + '/validate', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ key: cleanKey, machineId }),
        timeout: 10000,
      });
      const d = await r.json();
      if (!d.valid) return { ok: false, error: d.error || 'License key is not valid.' };
      const data = {
        tier:        d.tier || 'pro',
        key:         cleanKey,
        activatedAt: new Date().toISOString(),
        expiry:      d.expiry || null,
        machineId,
      };
      writeLicense(data);
      return { ok: true, ...data };
    } catch (err) {
      return { ok: false, error: 'Could not reach license server: ' + err.message };
    }
  }

  // Offline / dev mode
  const tier = detectTierFromKey(cleanKey);
  const data = {
    tier,
    key:         cleanKey,
    activatedAt: new Date().toISOString(),
    expiry:      null,
    offline:     true,
    machineId,
  };
  writeLicense(data);
  return { ok: true, ...data };
}

module.exports = {
  TIERS,
  readLicense,
  writeLicense,
  deactivateLicense,
  getMachineId,
  getEffectiveTier,
  getTierInfo,
  getMonthlyQueryCount,
  getUploadCount,
  checkQueryGate,
  checkUploadGate,
  activateLicense,
  isExpired,
};
