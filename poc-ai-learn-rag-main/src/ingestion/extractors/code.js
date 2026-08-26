const fs   = require('fs');
const path = require('path');

const EXT_TO_LANG = {
  // JavaScript / TypeScript
  '.js': 'javascript', '.jsx': 'javascript',
  '.ts': 'typescript', '.tsx': 'typescript',
  // Python / Ruby
  '.py': 'python', '.rb': 'ruby',
  // Systems
  '.go': 'go', '.java': 'java',
  '.rs': 'rust', '.cpp': 'cpp', '.c': 'c',
  '.cs': 'csharp', '.swift': 'swift', '.kt': 'kotlin',
  // Web / scripting
  '.php': 'php', '.sh': 'bash',
  // Styles
  '.css': 'css', '.scss': 'scss', '.less': 'less', '.sass': 'sass',
  // Frameworks
  '.vue': 'vue', '.svelte': 'svelte',
  // Data / config
  '.yaml': 'yaml', '.yml': 'yaml',
  '.json': 'json', '.toml': 'toml', '.ini': 'ini',
  '.xml': 'xml', '.env': 'env',
  // Query / schema
  '.sql': 'sql', '.graphql': 'graphql', '.gql': 'graphql',
  // Infrastructure
  '.tf': 'terraform', '.proto': 'protobuf',
};

// Patterns that mark the start of a new top-level declaration
const BLOCK_PATTERNS = {
  javascript: /^(\/\/ ──|export\s+(default\s+)?(async\s+)?function\s|export\s+(const|class)\s|(async\s+)?function\s+\w+\s*\(|module\.exports)/,
  typescript: /^(\/\/ ──|export\s+(default\s+)?(async\s+)?function\s|export\s+(const|class|interface|type)\s|(async\s+)?function\s+\w+\s*\()/,
  python:     /^(def |class |async def )/,
  go:         /^func /,
  rust:       /^(pub\s+)?(fn |struct |impl |enum |trait )/,
};

function splitByDeclarations(content, lang) {
  const pattern = BLOCK_PATTERNS[lang];
  if (!pattern) return [content];

  const lines  = content.split('\n');
  const blocks = [];
  let current  = [];

  for (const line of lines) {
    if (current.length > 3 && pattern.test(line)) {
      const block = current.join('\n').trim();
      if (block.length > 40) blocks.push(block);
      current = [line];
    } else {
      current.push(line);
    }
  }

  const last = current.join('\n').trim();
  if (last.length > 40) blocks.push(last);

  return blocks.length > 0 ? blocks : [content];
}

/**
 * Pure function: format raw code content into [{name, content}] entries.
 * Used by both extractFromCode (file-based) and zip.js (content-based).
 */
function formatCodeContent(rawContent, filename) {
  const ext  = path.extname(filename).toLowerCase();
  const lang = EXT_TO_LANG[ext] || 'code';
  const name = path.basename(filename);

  const blocks = splitByDeclarations(rawContent, lang);

  if (blocks.length <= 1) {
    return [{ name, content: `[File: ${name}]\n[Language: ${lang}]\n\n${rawContent}` }];
  }

  return blocks.map((block, i) => ({
    name: `${name} (block ${i + 1}/${blocks.length})`,
    content: `[File: ${name}]\n[Language: ${lang}]\n[Block: ${i + 1}/${blocks.length}]\n\n${block}`,
  }));
}

function extractFromCode(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  return formatCodeContent(content, filePath);
}

module.exports = { extractFromCode, formatCodeContent, EXT_TO_LANG };
