// Shared single-turn LLM caller. Used by query.js (via inline copies) and decisions extractor.
// Supports ollama / claude / vllm via LLM_PROVIDER env var.
// opts.maxTokens — override default 512 (needed for large structured outputs like onboarding paths)

async function askLlm(systemPrompt, userMessage, opts) {
  const maxTokens = (opts && opts.maxTokens) || 512;
  const provider  = (process.env.LLM_PROVIDER || 'ollama').toLowerCase();
  const messages  = [{ role: 'user', content: userMessage }];
  if (provider === 'claude') return askClaude(systemPrompt, messages, maxTokens);
  if (provider === 'vllm')   return askVllm(systemPrompt, messages, maxTokens);
  return askOllama(systemPrompt, messages, maxTokens);
}

async function askOllama(systemPrompt, messages, maxTokens) {
  const model   = process.env.OLLAMA_MODEL    || 'qwen2.5:3b';
  const baseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
  let res;
  try {
    res = await fetch(baseUrl + '/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages: [{ role: 'system', content: systemPrompt }, ...messages],
        stream: false,
        options: { temperature: 0.1, num_predict: maxTokens },
      }),
    });
  } catch (err) {
    if (err.code === 'ECONNREFUSED') throw new Error('Ollama is not running. Run: ollama serve');
    throw err;
  }
  if (!res.ok) throw new Error('Ollama error: ' + await res.text());
  const data = await res.json();
  return data.message?.content || data.response || '';
}

async function askClaude(systemPrompt, messages, maxTokens) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey.includes('sk-ant-...')) throw new Error('ANTHROPIC_API_KEY not set');
  const model = process.env.CLAUDE_MODEL || 'claude-haiku-4-5-20251001';
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model, max_tokens: maxTokens, system: systemPrompt, messages }),
  });
  const data = await res.json();
  if (data.error) throw new Error('Claude API: ' + data.error.message);
  return data.content?.[0]?.text || '';
}

async function askVllm(systemPrompt, messages, maxTokens) {
  const baseUrl = process.env.VLLM_BASE_URL || 'http://localhost:8000';
  const model   = process.env.VLLM_MODEL    || 'default';
  let res;
  try {
    res = await fetch(baseUrl + '/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages: [{ role: 'system', content: systemPrompt }, ...messages],
        temperature: 0.1,
        max_tokens: maxTokens,
      }),
    });
  } catch (err) {
    if (err.code === 'ECONNREFUSED') throw new Error('vLLM not running at ' + baseUrl);
    throw err;
  }
  if (!res.ok) throw new Error('vLLM error (' + res.status + '): ' + await res.text());
  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}

module.exports = { askLlm };
