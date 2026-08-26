import { describe, it, expect } from 'vitest'

// compressContext is exported from query.js but requires env setup.
// We test the pure algorithm by extracting the two sub-functions inline.

function trigrams(text) {
  const words = text.toLowerCase().split(/\s+/)
  const tg = new Set()
  for (let i = 0; i < words.length - 2; i++) {
    tg.add(words[i] + ' ' + words[i + 1] + ' ' + words[i + 2])
  }
  return tg
}

function jaccardSim(a, b) {
  const sa = trigrams(a)
  const sb = trigrams(b)
  let inter = 0
  for (const t of sa) if (sb.has(t)) inter++
  return inter / (sa.size + sb.size - inter + 1e-10)
}

function makeChunk(text, score = 0.5) {
  return {
    id: `chunk-${Math.random()}`,
    text,
    score,
    meta: { section: 'test', nearHeading: 'Test', title: 'Test', url: '', breadcrumb: 'Test', chunkIndex: 0, tokens: 10 },
    semScore: score * 100,
    bm25Score: 1,
    embedding: [],
  }
}

// Inline compressContext to avoid env-loading side effects
function compressContext(chunks, budget = 1800, minScore = 0.15) {
  const CHARS_PER_TOK = 4
  let kept = chunks.filter(c => c.score >= minScore)
  if (kept.length === 0) kept = chunks.slice(0, 1)

  const deduped = []
  for (const chunk of kept) {
    const isDupe = deduped.some(c => jaccardSim(c.text, chunk.text) > 0.60)
    if (!isDupe) deduped.push(chunk)
  }

  const budgetChars = budget * CHARS_PER_TOK
  let usedChars = 0
  const selected = []
  for (const chunk of deduped) {
    const chunkChars = chunk.text.length + 80
    if (usedChars + chunkChars > budgetChars && selected.length > 0) break
    selected.push(chunk)
    usedChars += chunkChars
  }
  return selected
}

describe('compressContext', () => {
  it('keeps chunks above minScore', () => {
    const chunks = [makeChunk('alpha bravo charlie delta', 0.5), makeChunk('echo foxtrot golf hotel', 0.1)]
    const result = compressContext(chunks, 1800, 0.15)
    expect(result).toHaveLength(1)
    expect(result[0].score).toBe(0.5)
  })

  it('falls back to at least one chunk when all below minScore', () => {
    const chunks = [makeChunk('alpha bravo charlie delta', 0.05)]
    const result = compressContext(chunks, 1800, 0.15)
    expect(result).toHaveLength(1)
  })

  it('deduplicates near-identical chunks', () => {
    const text = 'the quick brown fox jumps over the lazy dog near the riverbank'
    const chunks = [makeChunk(text, 0.8), makeChunk(text, 0.7)]
    const result = compressContext(chunks)
    expect(result).toHaveLength(1)
    expect(result[0].score).toBe(0.8) // higher-scored kept
  })

  it('keeps distinct chunks that are not duplicates', () => {
    const chunks = [
      makeChunk('authentication endpoint requires bearer token header', 0.8),
      makeChunk('pagination uses cursor based approach in the response body', 0.7),
    ]
    const result = compressContext(chunks)
    expect(result).toHaveLength(2)
  })

  it('respects budget and stops adding chunks when exceeded', () => {
    // budget = 10 tokens = 40 chars. Each chunk text ~60 chars → only fits 1.
    const text = 'a b c d e f g h i j k l m n o p q r s t' // ~40 chars
    const chunks = [makeChunk(text, 0.9), makeChunk(text + ' extra words here', 0.8)]
    const result = compressContext(chunks, 10) // very small budget
    expect(result).toHaveLength(1)
  })

  it('returns empty array when given empty input', () => {
    // With no chunks, slice(0,1) returns [] — no crash
    const result = compressContext([])
    expect(result).toHaveLength(0)
  })
})

describe('jaccardSim', () => {
  it('returns ~1 for identical text', () => {
    const text = 'the quick brown fox jumps over the lazy dog'
    expect(jaccardSim(text, text)).toBeCloseTo(1, 3)
  })

  it('returns 0 for completely different text', () => {
    expect(jaccardSim('alpha bravo charlie', 'delta echo foxtrot')).toBe(0)
  })

  it('returns intermediate value for partial overlap', () => {
    // Strings must be long enough to share at least one 3-word trigram
    const sim = jaccardSim(
      'the bearer token authentication endpoint requires valid credentials here',
      'the bearer token authentication system needs a different value here'
    )
    expect(sim).toBeGreaterThan(0)
    expect(sim).toBeLessThan(1)
  })
})
