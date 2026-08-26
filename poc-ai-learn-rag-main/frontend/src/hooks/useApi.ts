import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { StatsData, SectionData, SessionSummary, StoredMessage, LicenseData, UploadedFile, AnalyticsData, GapsData, GapIntelligenceData, DocOutline, MemoryData, KnowledgeMapData, DecisionsData, ExtractResult, HealthData, SectionPriority, ReviewResult, OnboardingResult, RiskData, InsightsData, InsightsFilters, IntelligenceHistory, UserEntry, TeamIdsData, StalenessData, MaintenanceSuggestResult, RagasStatusData } from '../types'

async function apiFetch<T>(url: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: opts?.body ? { 'Content-Type': 'application/json', ...opts.headers } : opts?.headers,
    ...opts,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
    throw new Error(err.error || `HTTP ${res.status}`)
  }
  return res.json()
}

export function useAppStatus() {
  return useQuery({
    queryKey: ['app-status'],
    queryFn: () => apiFetch<{ setupComplete: boolean; appName: string }>('/api/app/status'),
    retry: 1,
  })
}

export function useStats() {
  return useQuery({
    queryKey: ['stats'],
    queryFn: () => apiFetch<StatsData>('/api/stats'),
    staleTime: 30_000,
  })
}

export function useSections() {
  return useQuery({
    queryKey: ['sections'],
    queryFn: () => apiFetch<{ sections: SectionData[] }>('/api/sections'),
    staleTime: 30_000,
  })
}

export function useSessions() {
  return useQuery({
    queryKey: ['sessions'],
    queryFn: () => apiFetch<{ sessions: SessionSummary[] }>('/api/sessions'),
    staleTime: 5_000,
  })
}

export function useSession(sessionId: string, enabled = true) {
  return useQuery({
    queryKey: ['session', sessionId],
    queryFn: () => apiFetch<{ messages: StoredMessage[]; title: string; createdAt: string }>(`/api/session/${sessionId}`),
    enabled,
  })
}

export function useLicense() {
  return useQuery({
    queryKey: ['license'],
    queryFn: () => apiFetch<LicenseData>('/api/license'),
    staleTime: 60_000,
  })
}

export function useUploads(enabled: boolean) {
  return useQuery({
    queryKey: ['uploads'],
    queryFn: () => apiFetch<{ uploads: UploadedFile[] }>('/api/docs/uploads'),
    enabled,
  })
}

export function useAnalytics(enabled: boolean) {
  return useQuery({
    queryKey: ['analytics'],
    queryFn: () => apiFetch<AnalyticsData>('/api/analytics'),
    enabled,
    staleTime: 0,
  })
}

export function useGaps(enabled: boolean) {
  return useQuery({
    queryKey: ['gaps'],
    queryFn: () => apiFetch<GapsData>('/api/gaps'),
    enabled,
    staleTime: 0,
  })
}

export function useGapIntelligence(enabled: boolean) {
  return useQuery({
    queryKey: ['gap-intelligence'],
    queryFn: () => apiFetch<GapIntelligenceData>('/api/gaps/intelligence'),
    enabled,
    staleTime: 0,
  })
}

export function useKnowledgeMap(q: string, enabled: boolean) {
  return useQuery({
    queryKey: ['knowledge-map', q],
    queryFn: () => apiFetch<KnowledgeMapData>(`/api/knowledge/map?q=${encodeURIComponent(q)}`),
    enabled: enabled && q.length > 1,
    staleTime: 0,
  })
}

export function useKnowledgeSummary() {
  return useMutation({
    mutationFn: (data: KnowledgeMapData) =>
      apiFetch<{ topic: string; summary: string }>('/api/knowledge/summary', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  })
}

export function useGenerateDocOutline() {
  return useMutation({
    mutationFn: ({ topic, questions }: { topic: string; questions: string[] }) =>
      apiFetch<{ topic: string; outline: DocOutline }>('/api/gaps/outline', {
        method: 'POST',
        body: JSON.stringify({ topic, questions }),
      }),
  })
}

export function useDecisions(section?: string, q?: string) {
  const params = new URLSearchParams()
  if (section) params.set('section', section)
  if (q) params.set('q', q)
  const qs = params.toString()
  return useQuery({
    queryKey: ['decisions', section, q],
    queryFn: () => apiFetch<DecisionsData>('/api/decisions' + (qs ? '?' + qs : '')),
    staleTime: 0,
  })
}

export function useExtractDecisions() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => apiFetch<ExtractResult>('/api/decisions/extract', { method: 'POST' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['decisions'] }),
  })
}

export function useHealth(enabled: boolean) {
  return useQuery({
    queryKey: ['health'],
    queryFn: () => apiFetch<HealthData>('/api/health'),
    enabled,
    staleTime: 0,
  })
}

export function usePatchHealthSection() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ section, priority }: { section: string; priority: SectionPriority }) =>
      apiFetch<{ ok: boolean }>(`/api/health/section/${encodeURIComponent(section)}`, {
        method: 'PATCH',
        body: JSON.stringify({ priority }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['health'] }),
  })
}

export function useRemoveHealthSection() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (section: string) =>
      apiFetch<{ ok: boolean; chunksRemoved: number }>(`/api/health/section/${encodeURIComponent(section)}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['health'] })
      qc.invalidateQueries({ queryKey: ['stats'] })
      qc.invalidateQueries({ queryKey: ['sections'] })
    },
  })
}

export function useReviewSection() {
  return useMutation({
    mutationFn: (section: string) =>
      apiFetch<ReviewResult>(`/api/health/review/${encodeURIComponent(section)}`, {
        method: 'POST',
      }),
  })
}

export function useGenerateOnboarding() {
  return useMutation({
    mutationFn: (params: { role: string; topic?: string }) =>
      apiFetch<OnboardingResult>('/api/onboard', {
        method: 'POST',
        body: JSON.stringify(params),
      }),
  })
}

export function useInsights(enabled: boolean, filters?: Partial<InsightsFilters>) {
  const params = new URLSearchParams()
  if (filters?.window  && filters.window  !== 'all') params.set('window',  filters.window)
  if (filters?.last    && filters.last    >  0)       params.set('last',    String(filters.last))
  if (filters?.section && filters.section !== '')     params.set('section', filters.section)
  if (filters?.status  && filters.status  !== 'all') params.set('status',  filters.status)
  if (filters?.keyword && filters.keyword !== '')     params.set('keyword', filters.keyword)
  if (filters?.userId  && filters.userId  !== '')     params.set('user',    filters.userId)
  const qs = params.toString()
  return useQuery({
    queryKey: ['insights', qs],
    queryFn: () => apiFetch<InsightsData>(`/api/insights${qs ? '?' + qs : ''}`),
    enabled,
    staleTime: 0,
  })
}

export function useUsers(enabled: boolean) {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => apiFetch<{ users: UserEntry[] }>('/api/users'),
    enabled,
    staleTime: 30_000,
  })
}

export function useKnowledgeRisk(enabled: boolean) {
  return useQuery({
    queryKey: ['knowledge-risk'],
    queryFn: () => apiFetch<RiskData>('/api/knowledge/risk'),
    enabled,
    staleTime: 0,
  })
}

export function useMemory(enabled: boolean) {
  return useQuery({
    queryKey: ['memory'],
    queryFn: () => apiFetch<MemoryData>('/api/memory'),
    enabled,
    staleTime: 0,
  })
}

export function useDeleteSession() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiFetch(`/api/session/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sessions'] }),
  })
}

export function useDeleteUpload() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (name: string) => apiFetch(`/api/docs/upload/${encodeURIComponent(name)}`, { method: 'DELETE' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['uploads'] })
      qc.invalidateQueries({ queryKey: ['stats'] })
      qc.invalidateQueries({ queryKey: ['sections'] })
    },
  })
}

export function useActivateLicense() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (key: string) =>
      apiFetch<{ tierName: string }>('/api/license/activate', { method: 'POST', body: JSON.stringify({ key }) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['license'] }),
  })
}

export function useDeactivateLicense() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => apiFetch('/api/license', { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['license'] }),
  })
}

export interface DiscoverResult {
  title: string
  url: string
  snippet: string
}

export async function searchDiscover(query: string, maxResults = 10): Promise<{ results: DiscoverResult[]; error?: string }> {
  const res = await fetch('/api/search/discover', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, maxResults }),
  })
  if (!res.ok) return { results: [], error: `HTTP ${res.status}` }
  return res.json()
}

export function useTeamIds(enabled: boolean) {
  return useQuery({
    queryKey: ['team-ids'],
    queryFn: () => apiFetch<TeamIdsData>('/api/team/ids'),
    enabled,
    staleTime: 60_000,
  })
}

export function useIntelligenceHistory(enabled: boolean) {
  return useQuery({
    queryKey: ['intelligence-history'],
    queryFn: () => apiFetch<IntelligenceHistory>('/api/intelligence/history'),
    enabled,
    staleTime: 60_000,
  })
}

export async function forceSnapshot(): Promise<{ ok: boolean; reason?: string }> {
  const res = await fetch('/api/intelligence/snapshot', { method: 'POST' })
  return res.json()
}

export function useStaleness(enabled: boolean) {
  return useQuery({
    queryKey: ['maintenance-staleness'],
    queryFn: () => apiFetch<StalenessData>('/api/maintenance/staleness'),
    enabled,
    staleTime: 0,
  })
}

export function useMaintenanceSuggest() {
  return useMutation({
    mutationFn: ({ file, section }: { file: string; section: string }) =>
      apiFetch<MaintenanceSuggestResult>('/api/maintenance/suggest', {
        method: 'POST',
        body: JSON.stringify({ file, section }),
      }),
  })
}

// ── RAGAS hooks ───────────────────────────────────────────────────────────────

export function useRagasStatus(pollWhileBusy = false) {
  const { data, ...rest } = useQuery({
    queryKey: ['ragas-status'],
    queryFn: () => apiFetch<RagasStatusData>('/api/eval/ragas/status'),
    refetchInterval: pollWhileBusy ? 3000 : false,
    staleTime: 5_000,
  })
  return { data, ...rest }
}

export function useRagasHistory() {
  return useQuery({
    queryKey: ['ragas-history'],
    queryFn: () => apiFetch<{ history: RagasStatusData['history'] }>('/api/eval/ragas/history'),
    staleTime: 30_000,
  })
}

export function useGenerateEvalSet() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (count: number) =>
      apiFetch<{ ok: boolean; message: string }>('/api/eval/ragas/generate', {
        method: 'POST',
        body: JSON.stringify({ count }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ragas-status'] }),
  })
}

export function useRunRagas() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () =>
      apiFetch<{ ok: boolean; message: string }>('/api/eval/ragas/run', { method: 'POST' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ragas-status'] }),
  })
}
