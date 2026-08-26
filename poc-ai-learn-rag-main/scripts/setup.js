const fs   = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

console.log('\nKnowledge Hub — Setup\n');

['docs', 'data', 'user_data'].forEach(d => {
  const p = path.join(ROOT, d);
  if (!fs.existsSync(p)) { fs.mkdirSync(p, { recursive: true }); console.log('Created: ' + d + '/'); }
});

console.log('\nNext steps:\n');
console.log('  1. Install Ollama from https://ollama.com');
console.log('  2. Run: ollama serve');
console.log('  3. Pull a model: ollama pull qwen2.5:3b');
console.log('  4. Pull embeddings: ollama pull nomic-embed-text');
console.log('  5. npm run electron  — launches the setup wizard + chat UI');
console.log('     — OR —');
console.log('  5. npm run server    — headless server at http://localhost:3000\n');
