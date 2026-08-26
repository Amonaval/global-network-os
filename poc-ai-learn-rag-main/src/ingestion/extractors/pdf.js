const fs = require('fs');

// pdf-parse exports differ by version — handle both
const _pdfModule = require('pdf-parse');
const pdfParse   = typeof _pdfModule === 'function' ? _pdfModule
  : (typeof _pdfModule.default === 'function' ? _pdfModule.default : null);

if (!pdfParse) throw new Error('pdf-parse: could not load parse function. Try: npm install pdf-parse');

async function extractFromPdf(filePath) {
  const buffer = fs.readFileSync(filePath);
  const data   = await pdfParse(buffer);
  return data.text || '';
}

module.exports = { extractFromPdf };
