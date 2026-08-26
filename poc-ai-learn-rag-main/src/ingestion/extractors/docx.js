const mammoth = require('mammoth');

async function extractFromDocx(filePath) {
  const result = await mammoth.extractRawText({ path: filePath });
  return result.value || '';
}

module.exports = { extractFromDocx };
