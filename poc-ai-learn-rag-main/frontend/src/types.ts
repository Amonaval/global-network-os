export interface Source {
  title: string
  section: string
  url: string
  score: number
  nearHeading?: string
  snippet?: string
}

export interface DebugInfo {
  usedChunks: number
  droppedLow: number
  droppedDupe: number
  budgetUsed: number
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  text: string
  sources?: Source[]
  debug?: DebugInfo | null
  suggestions?: string[]
  isStreaming?: boolean
  isTyping?: boolean
  isError?: boolean
  errorType?: 'ollama' | 'generic'
  isLimitReached?: boolean
}

export interface SessionSummary {
  id: string
  title: string
  count: number
  updatedAt: string
  createdAt: string
}

export interface StoredMessage {
  role: 'user' | 'assistant'
  content: string
  ts: string
}

export interface StatsData {
  totalChunks: number
  llmProvider: string
  ollamaModel: string
  vllmModel: string
  embeddingProvider: string
  hybridWeight: number
}

export interface SectionData {
  section: string
  chunks: number
  displayName?: string
  type?: 'confluence' | 'portal' | 'uploads' | 'web-pages'
}

export interface LicenseData {
  tier: string
  tierName: string
  tierColor: string
  queryLimit: number
  uploadLimit: number
  queriesThisMonth: number
  uploadCount: number
  key?: string
  activatedAt?: string
  offline?: boolean
  stripeProMonthlyUrl?: string
  stripeProAnnualUrl?: string
  stripeLifetimeUrl?: string
}

export interface UploadedFile {
  name: string
  originalName: string
  chunks: number
  size: number
}

export interface AnalyticsData {
  summary: {
    total: number
    answered: number
    avgSemScore: number
    avgLatencyMs: number
  }
  topSections: { section: string; count: number }[]
  topUnanswered: { question: string; count: number }[]
  recentQueries: { question: string; topSemScore: number; latencyMs: number; blocked: boolean }[]
}

export interface GapCluster {
  label: string
  count: number
  firstSeen: string | null
  lastSeen: string | null
  questions: { text: string; count: number }[]
}

export interface GapsData {
  clusters: GapCluster[]
  totalBlocked: number
  totalClusters: number
}

export type GapActionType = 'create_doc' | 'update_section' | 'review_section'

export interface GapIntelligenceCluster {
  label: string
  count: number
  recentCount: number
  trending: boolean
  priority: number
  firstSeen: string | null
  lastSeen: string | null
  nearMissSections: string[]
  actionType: GapActionType
  actionLabel: string
  questions: { text: string; count: number }[]
}

export interface GapIntelligenceData {
  clusters: GapIntelligenceCluster[]
  totalBlocked: number
  totalClusters: number
  hardBlocked: number
  softBlocked: number
}

export interface DocOutlineSection {
  heading: string
  contentHint: string
}

export interface DocOutline {
  title: string
  summary: string
  sections: DocOutlineSection[]
  estimatedReadMins: number
}

export interface MemoryCluster {
  label: string
  count: number
  recentCount: number
  trending: boolean
  firstSeen: string | null
  lastSeen: string | null
  questions: { text: string; count: number }[]
  topSections: { section: string; count: number }[]
}

export interface MemoryData {
  clusters: MemoryCluster[]
  totalAnswered: number
  totalTopics: number
}

export interface Decision {
  id: string
  decision: string
  reason: string | null
  alternatives: string[]
  section: string
  title: string
  url: string
  sourceText: string
  extractedAt: string
}

export interface DecisionsData {
  decisions: Decision[]
  total: number
  sections: string[]
}

export type SectionPriority = 'boost' | 'ignore' | 'normal'
export type SectionRecommendation = 'consider-removing' | 'consider-boosting' | null

export interface HealthSection {
  section: string
  score: number
  queryCount: number
  daysSinceLastHit: number | null
  lastHitTs: string | null
  priority: SectionPriority
  recommendation: SectionRecommendation
}

export interface HealthData {
  sections: HealthSection[]
  totalSections: number
  totalAnswered: number
  computedAt: string
}

export interface ExtractResult {
  ok: boolean
  extracted: number
  scanned: number
  candidates: number
  parseFailures: number
}

export type OnboardPriority = 'start' | 'next' | 'later' | 'skip'

export interface OnboardingPathItem {
  section: string
  priority: OnboardPriority
  reason: string
  estimatedReadMins: number
  queries: number
}

export interface OnboardingResult {
  role: string
  topic: string | null
  summary: string
  path: OnboardingPathItem[]
  generatedAt: string
}

export interface ReviewSuggestion {
  topic: string
  detail: string
}

export interface ReviewResult {
  section: string
  suggestions: ReviewSuggestion[]
  gapQueriesAnalyzed: number
  chunksAnalyzed: number
}

export interface KnowledgeDocSection {
  section: string
  chunkCount: number
  topScore: number
  sampleTitles: string[]
}

export interface KnowledgeDecision {
  id: string
  decision: string
  reason: string | null
  section: string
  url: string
}

export interface KnowledgeMemoryCluster {
  label: string
  count: number
  recentCount: number
  trending: boolean
  topSections: string[]
  questions: string[]
}

export interface KnowledgeGapCluster {
  label: string
  count: number
  questions: string[]
}

export interface KnowledgeMapData {
  topic: string
  docSections: KnowledgeDocSection[]
  relatedDecisions: KnowledgeDecision[]
  memoryCluster: KnowledgeMemoryCluster | null
  gapCluster: KnowledgeGapCluster | null
}

export type InsightsTrend = 'improving' | 'declining' | 'stable' | 'new'

export interface InsightsTopic {
  topic: string
  count: number
  thisWeek: number
  lastWeek: number
  trending: boolean
}

export interface InsightsPainArea {
  section: string
  totalQueries: number
  answered: number
  failureCount: number
  successRate: number
  painScore: number
}

export interface InsightsQualityTrend {
  section: string
  recentRate: number | null
  priorRate: number | null
  delta: number | null
  trend: InsightsTrend
  queryCount: number
}

export interface InsightsGap {
  topic: string
  count: number
  recentCount: number
  lastSeen: string
  priority: number
}

export interface InsightsFilters {
  window: 'all' | '7d' | '30d' | '90d' | '180d'
  last: 0 | 5 | 10 | 25 | 50 | 100
  section: string
  status: 'all' | 'answered' | 'unanswered'
  keyword: string
  userId: string
}

export interface UserEntry {
  userId: string
  queryCount: number
}

export interface TeamIdsUser {
  userId: string
  queryCount: number
  ids: number
}

export interface TeamIdsData {
  teamIds: number
  userCount: number
  perUser: TeamIdsUser[]
}

export interface InsightsData {
  topTopics: InsightsTopic[]
  painAreas: InsightsPainArea[]
  qualityTrend: InsightsQualityTrend[]
  recurringGaps: InsightsGap[]
  totalQueries: number
  totalAnswered: number
  overallSuccessRate: number
  computedAt: string
  filtered?: boolean
  totalUnfiltered?: number
  appliedFilters?: InsightsFilters
}

export type RiskLevel = 'critical' | 'high' | 'medium' | 'low'
export type RiskSignal = 'dead_section' | 'single_expert' | 'single_point_of_failure'

export interface RiskSection {
  section: string
  chunkCount: number
  riskScore: number
  riskLevel: RiskLevel
  signals: RiskSignal[]
  queryCount: number
  uniqueTopics: number
  spofTopics: string[]
  recommendation: string
}

export interface RiskData {
  sections: RiskSection[]
  totalSections: number
  criticalCount: number
  highCount: number
  mediumCount: number
  lowCount: number
  computedAt: string
}

export interface IntelligenceSnapshot {
  ts: string
  schemaVersion: number
  totalQueries: number
  totalAnswered: number
  overallSuccessRate: number
  totalBlocked: number
  clusterCount: number
  sectionCount: number
  avgHealthScore: number
  totalDecisions: number
  ids: number
  topTopics: string[]
}

export interface IntelligenceDelta {
  ids: number
  totalQueries: number
  clusterCount: number
  successRate: number
  totalBlocked: number
  avgHealthScore: number
}

export interface IntelligenceHistory {
  snapshots: IntelligenceSnapshot[]
  latestDelta: IntelligenceDelta | null
}

export interface ChunkResult {
  id: string
  text: string
  score: number
  semScore: number
  section: string
  meta: Record<string, unknown>
}

export type StalenessReason = 'content_changed' | 'modified_after_ingest'

export interface StaleCandidate {
  file: string
  section: string
  title: string | null
  lastIngest: string
  fileMtime: string | null
  stalenessReason: StalenessReason
  contentChanged: boolean
}

export interface StalenessData {
  lastIngest: string | null
  staleCandidates: StaleCandidate[]
  freshCount: number
  staleCount: number
  totalTracked: number
  checkedAt: string
}

export interface MaintenanceSuggestion {
  topic: string
  detail: string
  severity: 'high' | 'medium' | 'low'
}

export interface MaintenanceSuggestResult {
  file: string
  section: string
  suggestions: MaintenanceSuggestion[]
  chunksAnalyzed: number
}

export interface UrlGroup {
  name: string
  urls: string
}

export interface WizardForm {
  appName: string
  sourceType: 'portal' | 'confluence' | 'url'
  portalUrl: string
  sections: string
  contentSelector: string
  nextBtnSelector: string
  confluenceUrl: string
  confluenceSpaces: string
  confluenceAuthMethod: 'apitoken' | 'oauth'
  confluenceEmail: string
  confluenceToken: string
  confluenceClientId: string
  confluenceClientSecret: string
  authType: 'none' | 'form' | 'microsoft' | 'browser'
  authEmail: string
  authPassword: string
  llmProvider: 'ollama' | 'claude' | 'vllm'
  ollamaUrl: string
  ollamaModel: string
  anthropicKey: string
  vllmUrl: string
  vllmModel: string
  embProvider: 'nomic' | 'tfidf' | 'openai'
  openaiKey: string
  urlGroups: UrlGroup[]
  urlSelector: string
}

// ── RAGAS Evaluation ──────────────────────────────────────────────────────────

export interface RagasRunSummary {
  ts:               string
  totalItems:       number
  evaluatedItems:   number
  blockedItems:     number
  faithfulness:     number | null
  contextPrecision: number | null
  contextRecall:    number | null
  durationMs:       number
}

export interface RagasEvalSetStatus {
  exists:      boolean
  count:       number
  sections?:   string[]
  generatedAt?: string | null
}

export interface RagasProgress {
  step:            'generate' | 'eval'
  done:            number
  total:           number
  currentQuestion?: string
}

export interface RagasStatusData {
  evalSet:         RagasEvalSetStatus
  latest:          RagasRunSummary | null
  history:         RagasRunSummary[]
  generating:      boolean
  evaluating:      boolean
  progress:        RagasProgress | null
  rerankerEnabled: boolean
  docTypeChunking: boolean
}
