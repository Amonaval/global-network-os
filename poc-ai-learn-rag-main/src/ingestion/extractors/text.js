const fs = require('fs');

function extractFromText(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

module.exports = { extractFromText };
