// Core domain types shared across the codebase.
// All .js files can import these via JSDoc @typedef — no code changes required.

export interface ChunkMeta {
  section: string
  title: string
  url: string
  nearHeading: string
  chunkIndex: number
  breadcrumb: string
  tokens: number
}

export interface Chunk {
  id: string
  text: string
  meta: ChunkMeta
  embedding: number[]
}

export interface ScoredChunk extends Chunk {
  semScore: number    // cosine * 100 (0–100)
  bm25Score: number   // raw BM25 score (0–∞)
  score: number       // RRF score (0.0–0.02 typical)
  rank?: number
}

export interface Message {
  role: 'user' | 'assistant'
  content: string
  ts: string
}

export interface Session {
  id: string
  title: string
  createdAt: string
  updatedAt: string
  messages: Message[]
}

export interface IngestMeta {
  embeddingProvider: string
  lastIngest: string
  totalChunks: number
  skippedChunks: number
  dims: number
  maxChunkChars: number
}

export interface LicenseRecord {
  tier: 'free' | 'pro' | 'lifetime'
  key?: string
  activatedAt?: string
  machineId?: string
}

export interface AppConfig {
  app: {
    name: string
  }
  source: {
    type: 'portal' | 'confluence' | 'upload'
  }
  portal: {
    baseUrl: string
    sections: string[]
    contentSelector: string
    nextButtonSelector: string
  }
  confluence: {
    url: string
    spaces: string[]
    authMethod: 'apitoken' | 'oauth'
    email: string
    apiToken: string
    oauthToken?: string
    cloudId?: string
  }
  auth: {
    type: 'none' | 'auth0' | 'microsoft'
    email: string
    password: string
  }
  llm: {
    provider: 'ollama' | 'claude' | 'vllm'
    ollamaUrl: string
    ollamaModel: string
    anthropicApiKey?: string
    claudeModel?: string
    vllmUrl?: string
    vllmModel?: string
  }
  embeddings: {
    provider: 'nomic' | 'tfidf' | 'openai'
    nomicModel: string
    openaiApiKey?: string
    openaiEmbeddingModel?: string
  }
  retrieval: {
    topK: number
    hybridWeight: number
    confidenceGate: number
    minChunkScore: number
    ctxTokenBudget: number
    chunkSize: number
    chunkOverlap: number
  }
  server: {
    port: number
  }
  setupComplete: boolean
}

export interface QueryDebug {
  used: number
  total: number
  droppedScore: number
  droppedDupe: number
  tokensBudget: number
  latencyMs?: number
}

export interface ChatResponse {
  answer: string
  sources: Array<{ section: string; title: string; url: string; score: number }>
  chunks: ScoredChunk[]
  followUps: string[]
  sessionId: string
  title: string
  debug: QueryDebug
}
