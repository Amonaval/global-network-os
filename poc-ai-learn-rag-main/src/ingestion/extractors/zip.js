const AdmZip = require('adm-zip');
const path   = require('path');
const { formatCodeContent, EXT_TO_LANG } = require('./code');

// Plain text/doc formats — extracted as-is
const TEXT_EXTS = new Set(['.txt', '.md', '.html', '.htm', '.csv', '.rst', '.log']);

// Code formats — extracted with [File:][Language:] metadata prefix + block splitting
const CODE_EXTS = new Set(Object.keys(EXT_TO_LANG));

function extractFromZip(filePath) {
  const zip     = new AdmZip(filePath);
  const results = [];

  for (const entry of zip.getEntries()) {
    if (entry.isDirectory) continue;

    const ext = path.extname(entry.entryName).toLowerCase();
    if (!TEXT_EXTS.has(ext) && !CODE_EXTS.has(ext)) continue;

    const raw = zip.readAsText(entry);
    if (!raw || raw.trim().length <= 20) continue;

    if (CODE_EXTS.has(ext)) {
      results.push(...formatCodeContent(raw, entry.entryName));
    } else {
      results.push({ name: path.basename(entry.entryName), content: raw });
    }
  }

  return results;
}

module.exports = { extractFromZip };
