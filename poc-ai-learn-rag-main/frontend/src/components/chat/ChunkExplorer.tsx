import { useState, useCallback } from 'react'
import { useAppStore } from '../../store/appStore'
import { useSections } from '../../hooks/useApi'
import type { ChunkResult } from '../../types'

type SortMode = 'rrf' | 'sem' | 'bm25'

interface Props {
  onClose: () => void
}

export function ChunkExplorer({ onClose }: Props) {
  const { selectedSections, pinnedChunkIds, togglePin, clearPins } = useAppStore()
  const { data: sectionsData } = useSections()
  const [query, setQuery] = useState('')
  const [chunks, setChunks] = useState<ChunkResult[]>([])
  const [sortMode, setSortMode] = useState<SortMode>('rrf')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [searched, setSearched] = useState(false)

  const sections = sectionsData?.sections ?? []
  const nameMap: Record<string, string> = {}
  for (const s of sections) nameMap[s.section] = s.displayName || s.section

  const sorted = [...chunks].sort((a, b) => {
    if (sortMode === 'sem')  return b.semScore - a.semScore
    if (sortMode === 'bm25') return (b.score - b.semScore) - (a.score - a.semScore)
    return b.score - a.score // rrf
  })

  const search = useCallback(async () => {
    if (!query.trim()) return
    setLoading(true)
    setError('')
    try {
      const r = await fetch('/api/chunks/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: query.trim(),
          sections: selectedSections.length > 0 ? selectedSections : undefined,
          topK: 20,
        }),
      })
      const data = await r.json()
      if (!r.ok) throw new Error(data.error || 'Search failed')
      setChunks(data.chunks || [])
      setSearched(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Search failed')
    } finally {
      setLoading(false)
    }
  }, [query, selectedSections])

  const toggleExpand = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id); else next.add(id)
      return next
    })
  }

  return (
    <div className="panel-overlay chunk-explorer">
      <div className="panel-header">
        <div className="panel-title">
          <span>🔍 Chunk Explorer</span>
          <p className="panel-desc">Search the vector index directly. See exact chunks with similarity scores. Pin chunks to force them into your next answer.</p>
        </div>
        <button className="panel-close" onClick={onClose}>×</button>
      </div>

      <div className="ce-bar">
        <input
          className="ce-input"
          type="text"
          placeholder="Search chunks…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && search()}
          disabled={loading}
        />
        <button className="ce-search-btn" onClick={search} disabled={loading || !query.trim()}>
          {loading ? '…' : 'Search'}
        </button>
      </div>

      {selectedSections.length > 0 && (
        <div className="ce-scope">
          Searching in: {selectedSections.map(s => nameMap[s] || s).join(', ')}
        </div>
      )}

      <div className="ce-sort-row">
        {(['rrf', 'sem', 'bm25'] as SortMode[]).map(mode => (
          <button
            key={mode}
            className={`ce-sort-btn${sortMode === mode ? ' active' : ''}`}
            onClick={() => setSortMode(mode)}
          >
            {mode === 'rrf' ? 'Hybrid RRF' : mode === 'sem' ? 'Semantic' : 'BM25'}
          </button>
        ))}
        {pinnedChunkIds.length > 0 && (
          <span className="ce-pin-count">
            📌 {pinnedChunkIds.length} pinned
            <button className="ce-clear-pins" onClick={clearPins}>Clear</button>
          </span>
        )}
      </div>

      {error && <div className="ce-error">{error}</div>}

      <div className="ce-results">
        {searched && sorted.length === 0 && !loading && (
          <div className="ce-empty">No chunks found for this query.</div>
        )}
        {sorted.map((chunk, i) => {
          const isPinned = pinnedChunkIds.includes(chunk.id)
          const isExpanded = expanded.has(chunk.id)
          const rrfScore = (chunk.score * 1000).toFixed(1)
          const semPct   = (chunk.semScore * 100).toFixed(1)
          const sectionName = nameMap[chunk.section] || chunk.section
          const breadcrumb = chunk.meta.breadcrumb as string | undefined

          return (
            <div key={chunk.id} className={`ce-card${isPinned ? ' pinned' : ''}`}>
              <div className="ce-card-header">
                <div className="ce-card-meta">
                  <span className="ce-rank">#{i + 1}</span>
                  <span className="ce-section">{sectionName}</span>
                  {breadcrumb && breadcrumb !== sectionName && (
                    <span className="ce-breadcrumb" title={breadcrumb}>
                      {breadcrumb.length > 60 ? '…' + breadcrumb.slice(-55) : breadcrumb}
                    </span>
                  )}
                </div>
                <div className="ce-card-scores">
                  <span className="ce-score rrf" title="RRF score × 1000">RRF {rrfScore}</span>
                  <span className="ce-score sem" title="Semantic similarity">Sem {semPct}%</span>
                  <button
                    className={`ce-pin-btn${isPinned ? ' active' : ''}`}
                    onClick={() => togglePin(chunk.id)}
                    title={isPinned ? 'Unpin chunk' : 'Pin chunk — force into next answer'}
                  >
                    {isPinned ? '📌' : '📍'}
                  </button>
                </div>
              </div>
              <div
                className={`ce-card-text${isExpanded ? ' expanded' : ''}`}
                onClick={() => toggleExpand(chunk.id)}
              >
                {isExpanded ? chunk.text : (chunk.text.length > 300 ? chunk.text.slice(0, 300) + '…' : chunk.text)}
              </div>
              {chunk.text.length > 300 && (
                <button className="ce-expand-btn" onClick={() => toggleExpand(chunk.id)}>
                  {isExpanded ? '▲ Collapse' : '▼ Expand'}
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
