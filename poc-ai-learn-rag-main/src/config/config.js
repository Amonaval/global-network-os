const fs   = require('fs');
const path = require('path');
const { z } = require('zod');

// Runtime schema — all fields optional so partial/legacy configs still load cleanly.
// Validation runs on every readConfig(); issues are logged as warnings, never thrown.
const AppConfigSchema = z.object({
  app: z.object({
    name: z.string(),
    description: z.string(),
  }).partial().passthrough().optional(),

  source: z.object({
    type: z.enum(['portal', 'confluence', 'url']),
  }).partial().passthrough().optional(),

  urlFetch: z.object({
    urls: z.array(z.string()),
    contentSelector: z.string(),
  }).partial().passthrough().optional(),

  portal: z.object({
    baseUrl: z.string(),
    sections: z.array(z.string()),
    contentSelector: z.string(),
    nextButtonSelector: z.string(),
  }).partial().passthrough().optional(),

  confluence: z.object({
    url: z.string(),
    spaces: z.array(z.string()),
    authMethod: z.enum(['apitoken', 'oauth']),
    email: z.string(),
    apiToken: z.string(),
    oauthClientId: z.string(),
    oauthClientSecret: z.string(),
    oauthAccessToken: z.string(),
    oauthRefreshToken: z.string(),
    oauthCloudId: z.string(),
    oauthCloudName: z.string(),
  }).partial().passthrough().optional(),

  auth: z.object({
    type: z.enum(['none', 'form', 'microsoft', 'browser']),
    email: z.string(),
    password: z.string(),
  }).partial().passthrough().optional(),

  llm: z.object({
    provider: z.enum(['ollama', 'claude', 'vllm']),
    ollamaUrl: z.string(),
    ollamaModel: z.string(),
    anthropicApiKey: z.string(),
    claudeModel: z.string(),
    vllmUrl: z.string(),
    vllmModel: z.string(),
  }).partial().passthrough().optional(),

  embeddings: z.object({
    provider: z.enum(['nomic', 'tfidf', 'openai']),
    nomicModel: z.string(),
    openaiApiKey: z.string(),
  }).partial().passthrough().optional(),

  retrieval: z.object({
    topK: z.number().int().positive(),
    hybridWeight: z.number().min(0).max(1),
    confidenceGate: z.number().min(0).max(1),
    chunkSize: z.number().int().positive(),
    chunkOverlap: z.number().int().min(0),
  }).partial().passthrough().optional(),

  setupComplete: z.boolean().optional(),
}).passthrough();

const DEFAULT_CONFIG = {
  app: {
    name: 'Knowledge Hub',
    description: 'Internal documentation assistant',
  },
  source: {
    type: 'portal',   // 'portal' | 'confluence' | 'url'
  },
  urlFetch: {
    urls: [],
    contentSelector: '',
  },
  confluence: {
    url:                '',
    spaces:             [],
    authMethod:         'apitoken',   // 'apitoken' | 'oauth'
    email:              '',
    apiToken:           '',
    oauthClientId:      '',
    oauthClientSecret:  '',
    oauthAccessToken:   '',
    oauthRefreshToken:  '',
    oauthCloudId:       '',
    oauthCloudName:     '',
  },
  portal: {
    baseUrl: '',
    sections: [],
    contentSelector: '#main-content',
    nextButtonSelector: '.article-next',
  },
  auth: {
    type: 'none',     // none | form | microsoft | browser
    email: '',
    password: '',
  },
  llm: {
    provider: 'ollama',   // ollama | claude | vllm
    ollamaUrl: 'http://localhost:11434',
    ollamaModel: 'qwen2.5:3b',
    anthropicApiKey: '',
    claudeModel: 'claude-sonnet-4-20250514',
    vllmUrl: 'http://localhost:8000',
    vllmModel: '',
  },
  embeddings: {
    provider: 'nomic',   // nomic | tfidf | openai
    nomicModel: 'nomic-embed-text',
    openaiApiKey: '',
  },
  retrieval: {
    topK: 6,
    hybridWeight: 0.5,
    confidenceGate: 0.22,
    chunkSize: 400,
    chunkOverlap: 50,
  },
  setupComplete: false,
};

function getDataDir() {
  return process.env.DATA_DIR || path.resolve(process.cwd(), './data');
}

function getDocsDir() {
  const dataDir = getDataDir();
  return path.join(path.dirname(dataDir), 'docs');
}

function getUserDataDir() {
  const dataDir = getDataDir();
  return path.join(path.dirname(dataDir), 'user_data');
}

function getConfigPath() {
  const dataDir = getDataDir();
  fs.mkdirSync(dataDir, { recursive: true });
  return path.join(dataDir, 'app_config.json');
}

function deepMerge(target, source) {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    if (source[key] !== null && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(target[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }
  return result;
}

function readConfig() {
  const configPath = getConfigPath();
  if (!fs.existsSync(configPath)) return JSON.parse(JSON.stringify(DEFAULT_CONFIG));
  try {
    const raw = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const result = AppConfigSchema.safeParse(raw);
    if (!result.success) {
      console.warn('[config] app_config.json has type errors (using defaults for bad fields):');
      result.error.issues.forEach(issue =>
        console.warn(`  ${issue.path.join('.') || '(root)'} — ${issue.message}`)
      );
    }
    return deepMerge(JSON.parse(JSON.stringify(DEFAULT_CONFIG)), raw);
  } catch (err) {
    console.error('[config] Failed to read app_config.json:', err.message);
    return JSON.parse(JSON.stringify(DEFAULT_CONFIG));
  }
}

function writeConfig(partial) {
  const configPath = getConfigPath();
  const existing   = readConfig();
  const merged     = deepMerge(existing, partial);
  fs.writeFileSync(configPath, JSON.stringify(merged, null, 2), 'utf8');
  return merged;
}

function configToEnv(config) {
  return {
    DATA_DIR:             getDataDir(),
    DOCS_DIR:             getDocsDir(),
    APP_NAME:             (config.app && config.app.name) || 'Knowledge Hub',
    DOCS_BASE_URL:        (config.portal && config.portal.baseUrl) || '',
    DOCS_SECTIONS:        JSON.stringify((config.portal && config.portal.sections) || []),
    CONTENT_SELECTOR:     (config.portal && config.portal.contentSelector)   || '#main-content',
    NEXT_BUTTON_SELECTOR: (config.portal && config.portal.nextButtonSelector) || '.article-next',
    AUTH_TYPE:            (config.auth && config.auth.type)     || 'none',
    AUTH_EMAIL:           (config.auth && config.auth.email)    || '',
    AUTH_PASSWORD:        (config.auth && config.auth.password) || '',
    LLM_PROVIDER:         (config.llm && config.llm.provider)        || 'ollama',
    OLLAMA_BASE_URL:      (config.llm && config.llm.ollamaUrl)        || 'http://localhost:11434',
    OLLAMA_MODEL:         (config.llm && config.llm.ollamaModel)      || 'qwen2.5:3b',
    SOURCE_TYPE:              (config.source && config.source.type)                || 'portal',
    CONFLUENCE_URL:           (config.confluence && config.confluence.url)          || '',
    CONFLUENCE_SPACES:        JSON.stringify((config.confluence && config.confluence.spaces) || []),
    CONFLUENCE_AUTH_METHOD:   (config.confluence && config.confluence.authMethod)   || 'apitoken',
    CONFLUENCE_EMAIL:         (config.confluence && config.confluence.email)        || '',
    CONFLUENCE_API_TOKEN:     (config.confluence && config.confluence.apiToken)     || '',
    CONFLUENCE_ACCESS_TOKEN:  (config.confluence && config.confluence.oauthAccessToken) || '',
    CONFLUENCE_CLOUD_ID:      (config.confluence && config.confluence.oauthCloudId)     || '',
    URL_FETCH_GROUPS:         JSON.stringify((config.urlFetch && config.urlFetch.groups) || []),
    URL_FETCH_URLS:           JSON.stringify((config.urlFetch && config.urlFetch.urls) || []),
    URL_FETCH_SELECTOR:       (config.urlFetch && config.urlFetch.contentSelector)     || '',
    ANTHROPIC_API_KEY:    (config.llm && config.llm.anthropicApiKey)  || '',
    CLAUDE_MODEL:         (config.llm && config.llm.claudeModel)      || 'claude-sonnet-4-20250514',
    VLLM_BASE_URL:        (config.llm && config.llm.vllmUrl)          || 'http://localhost:8000',
    VLLM_MODEL:           (config.llm && config.llm.vllmModel)        || '',
    LICENSE_API_URL:      process.env.LICENSE_API_URL  || '',
    STRIPE_PRO_MONTHLY_URL:  process.env.STRIPE_PRO_MONTHLY_URL  || '',
    STRIPE_PRO_ANNUAL_URL:   process.env.STRIPE_PRO_ANNUAL_URL   || '',
    STRIPE_LIFETIME_URL:     process.env.STRIPE_LIFETIME_URL     || '',
    STRIPE_WEBHOOK_SECRET:   process.env.STRIPE_WEBHOOK_SECRET   || '',
    EMBEDDING_PROVIDER:   (config.embeddings && config.embeddings.provider)   || 'nomic',
    NOMIC_MODEL:          (config.embeddings && config.embeddings.nomicModel)  || 'nomic-embed-text',
    OPENAI_API_KEY:       (config.embeddings && config.embeddings.openaiApiKey) || '',
    TOP_K:                String((config.retrieval && config.retrieval.topK)           || 6),
    HYBRID_WEIGHT:        String((config.retrieval && config.retrieval.hybridWeight)   || 0.5),
    CONFIDENCE_GATE:      String((config.retrieval && config.retrieval.confidenceGate) || 0.22),
    CHUNK_SIZE:           String((config.retrieval && config.retrieval.chunkSize)      || 400),
    CHUNK_OVERLAP:        String((config.retrieval && config.retrieval.chunkOverlap)   || 50),
  };
}

module.exports = { readConfig, writeConfig, configToEnv, getDataDir, getDocsDir, getUserDataDir, DEFAULT_CONFIG, AppConfigSchema };
