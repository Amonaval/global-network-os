import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const catalogPath = path.join(root, 'lib/i18n/messages/en.ts');
const roots = ['app','components','lib','verticals','core','templates'];

const catalog = fs.readFileSync(catalogPath, 'utf8');
const tokenMatches = [...catalog.matchAll(/^\s{2}([A-Za-z0-9_]+):/gm)];
const tokens = new Set(tokenMatches.map(match => match[1]));
const failures = [];
let scanned = 0;
let calls = 0;

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const entry of fs.readdirSync(dir, {withFileTypes:true})) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (/\.(ts|tsx)$/.test(entry.name)) out.push(full);
  }
  return out;
}

for (const base of roots) {
  for (const file of walk(path.join(root, base))) {
    const source = fs.readFileSync(file, 'utf8');
    // Restrict the audit to files that participate in the typed i18n API.
    if (!source.includes('useLanguage')) continue;
    scanned += 1;
    const re = /\bt\(\s*["']([^"']+)["']\s*\)/g;
    for (const match of source.matchAll(re)) {
      calls += 1;
      const key = match[1];
      if (tokens.has(key)) continue;
      const line = source.slice(0, match.index).split('\n').length;
      failures.push(`${path.relative(root,file)}:${line} -> ${key}`);
    }
  }
}

console.log(`i18n token integrity: ${tokens.size} canonical tokens; ${scanned} i18n files; ${calls} literal t() calls checked.`);
if (failures.length) {
  console.error('\nUnknown i18n token(s):');
  for (const failure of failures) console.error(` - ${failure}`);
  console.error('\nAdd a canonical *Txt token to lib/i18n/messages/en.ts or replace the stale/ad-hoc key. Do not add compatibility aliases for rejected UI code.');
  process.exit(1);
}
console.log('PASS: every literal t("...") call resolves to the canonical English catalog.');
