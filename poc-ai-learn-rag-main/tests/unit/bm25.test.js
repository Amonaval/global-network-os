import { describe, it, expect, beforeEach } from 'vitest'

// BM25 is a pure class — test it directly.
// We inline to avoid dotenv side effects from store.js.
class BM25 {
  constructor(k1 = 1.5, b = 0.75) {
    this.k1 = k1
    this.b = b
    this.docs = []
    this.df = {}
    this.avgdl = 0
    this.N = 0
  }

  _tokenise(text) {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 1)
  }

  index(texts) {
    this.N = texts.length
    this.docs = texts.map(t => this._tokenise(t))
    this.df = {}
    let totalLen = 0
    for (const toks of this.docs) {
      totalLen += toks.length
      for (const t of new Set(toks)) {
        this.df[t] = (this.df[t] || 0) + 1
      }
    }
    this.avgdl = totalLen / (this.N || 1)
  }

  scores(query) {
    const qtoks = this._tokenise(query)
    const out = new Float32Array(this.N)
    for (const qt of qtoks) {
      const df_t = this.df[qt] || 0
      if (!df_t) continue
      const idf = Math.log((this.N - df_t + 0.5) / (df_t + 0.5) + 1)
      for (let i = 0; i < this.N; i++) {
        const dl = this.docs[i].length
        const tf = this.docs[i].filter(t => t === qt).length
        const numer = tf * (this.k1 + 1)
        const denom = tf + this.k1 * (1 - this.b + (this.b * dl) / this.avgdl)
        out[i] += (idf * numer) / denom
      }
    }
    return out
  }
}

describe('BM25', () => {
  let bm25

  beforeEach(() => {
    bm25 = new BM25()
  })

  it('scores exact match document higher than unrelated document', () => {
    bm25.index([
      'authentication bearer token api endpoint',
      'pagination cursor response body next link',
      'error handling retry exponential backoff',
    ])
    const scores = bm25.scores('authentication token')
    expect(scores[0]).toBeGreaterThan(scores[1])
    expect(scores[0]).toBeGreaterThan(scores[2])
  })

  it('returns zero scores for a query term not in any document', () => {
    bm25.index(['alpha beta gamma', 'delta epsilon zeta'])
    const scores = bm25.scores('completely unrelated word here')
    expect(scores[0]).toBe(0)
    expect(scores[1]).toBe(0)
  })

  it('gives higher score to document with higher term frequency', () => {
    bm25.index([
      'token token token api authentication token',
      'api authentication with a single token mention',
    ])
    const scores = bm25.scores('token')
    // BM25 saturates TF, so difference is moderate but first should still rank higher
    expect(scores[0]).toBeGreaterThan(scores[1])
  })

  it('handles empty corpus without throwing', () => {
    bm25.index([])
    const scores = bm25.scores('anything')
    expect(scores.length).toBe(0)
  })

  it('handles empty query without throwing', () => {
    bm25.index(['some document text here'])
    const scores = bm25.scores('')
    expect(scores[0]).toBe(0)
  })

  it('is case-insensitive', () => {
    bm25.index(['Bearer Token Authentication', 'unrelated content here now'])
    const lower = bm25.scores('bearer token')
    const upper = bm25.scores('BEARER TOKEN')
    expect(lower[0]).toBeCloseTo(upper[0], 5)
  })

  it('tokenises correctly — strips punctuation', () => {
    const tokens = bm25._tokenise('API-key: "some-value" (example)')
    expect(tokens).not.toContain('api-key')
    expect(tokens).toContain('api')
    expect(tokens).toContain('key')
    expect(tokens).toContain('some')
    expect(tokens).toContain('value')
    expect(tokens).toContain('example')
  })

  it('filters single-character tokens', () => {
    const tokens = bm25._tokenise('a b c hello world')
    expect(tokens).toContain('hello')
    expect(tokens).toContain('world')
    expect(tokens).not.toContain('a')
    expect(tokens).not.toContain('b')
  })
})
