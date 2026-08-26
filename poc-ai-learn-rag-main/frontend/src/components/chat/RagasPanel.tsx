import { useState, useEffect } from 'react'
import { useRagasStatus, useGenerateEvalSet, useRunRagas } from '../../hooks/useApi'
import { useQueryClient } from '@tanstack/react-query'
import type { RagasRunSummary } from '../../types'

interface Props {
  onBack: () => void
}

function pct(v: number | null | undefined): string {
  if (v === null || v === undefined) return '—'
  return Math.round(v * 100) + '%'
}

function scoreColor(v: number | null | undefined): string {
  if (v === null || v === undefined) return '#9ca3af'
  if (v >= 0.80) return '#22c55e'
  if (v >= 0.60) return '#f59e0b'
  return '#ef4444'
}

function MetricBar({ label, value, tooltip }: { label: string; value: number | null; tooltip: string }) {
  const pctNum = value !== null ? Math.round(value * 100) : 0
  const color  = scoreColor(value)
  return (
    <div className="ragas-metric-row" title={tooltip}>
      <span className="ragas-metric-label">{label}</span>
      <div className="ragas-metric-bar-wrap">
        <div className="ragas-metric-bar-fill" style={{ width: `${pctNum}%`, background: color }} />
      </div>
      <span className="ragas-metric-value" style={{ color }}>{pct(value)}</span>
    </div>
  )
}

function RunCard({ run, index }: { run: RagasRunSummary; index: number }) {
  const d   = new Date(run.ts)
  const ago = d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  return (
    <div className="ragas-history-card">
      <div className="ragas-history-header">
        <span className="ragas-history-label">Run #{index + 1}</span>
        <span className="ragas-history-ts">{ago}</span>
        <span className="ragas-history-items">{run.evaluatedItems}/{run.totalItems} items</span>
      </div>
      <div className="ragas-history-scores">
        <span style={{ color: scoreColor(run.faithfulness) }}>
          F: {pct(run.faithfulness)}
        </span>
        <span style={{ color: scoreColor(run.contextPrecision) }}>
          P: {pct(run.contextPrecision)}
        </span>
        <span style={{ color: scoreColor(run.contextRecall) }}>
          R: {pct(run.contextRecall)}
        </span>
        <span className="ragas-history-dur">{Math.round((run.durationMs || 0) / 1000)}s</span>
      </div>
    </div>
  )
}

export function RagasPanel({ onBack }: Props) {
  const [polling, setPolling]   = useState(false)
  const qc                      = useQueryClient()
  const { data, isLoading }     = useRagasStatus(polling)
  const generateMutation        = useGenerateEvalSet()
  const runMutation             = useRunRagas()

  // Start polling while generation or evaluation is in progress
  useEffect(() => {
    const busy = data?.generating || data?.evaluating
    setPolling(!!busy)
    if (!busy && polling) {
      // Refresh once more after completion
      qc.invalidateQueries({ queryKey: ['ragas-status'] })
    }
  }, [data?.generating, data?.evaluating])

  if (isLoading) return <div className="panel-loading">Loading RAGAS status…</div>

  const latest   = data?.latest
  const evalSet  = data?.evalSet
  const progress = data?.progress
  const busy     = data?.generating || data?.evaluating

  const handleGenerate = () => {
    generateMutation.mutate(30)
    setPolling(true)
  }

  const handleRun = () => {
    runMutation.mutate()
    setPolling(true)
  }

  return (
    <div className="ragas-panel">
      <div className="panel-header">
        <button className="back-btn" onClick={onBack}>← Back</button>
        <h2>Retrieval Quality — RAGAS</h2>
      </div>

      {/* Feature flags */}
      <div className="ragas-flags">
        <span className={'ragas-flag ' + (data?.rerankerEnabled ? 'ragas-flag-on' : 'ragas-flag-off')}>
          {data?.rerankerEnabled ? '✓' : '○'} Cross-encoder reranking
        </span>
        <span className={'ragas-flag ' + (data?.docTypeChunking ? 'ragas-flag-on' : 'ragas-flag-off')}>
          {data?.docTypeChunking ? '✓' : '○'} Doc-type chunking
        </span>
      </div>

      {/* Current scores */}
      <div className="ragas-scores-card">
        <div className="ragas-scores-header">
          <span className="ragas-scores-title">Latest Run</span>
          {latest && (
            <span className="ragas-scores-ts">
              {new Date(latest.ts).toLocaleDateString()}
            </span>
          )}
        </div>
        {latest ? (
          <>
            <MetricBar
              label="Faithfulness"
              value={latest.faithfulness}
              tooltip="Are answer claims grounded in the retrieved context? Higher = fewer hallucinations."
            />
            <MetricBar
              label="Context Precision"
              value={latest.contextPrecision}
              tooltip="Are the retrieved chunks actually relevant to the question? Higher = better retrieval."
            />
            <MetricBar
              label="Context Recall"
              value={latest.contextRecall}
              tooltip="Does the retrieved context cover the ground-truth answer? Higher = fewer gaps."
            />
          </>
        ) : (
          <p className="ragas-no-data">No evaluation run yet. Generate a test set and run evaluation below.</p>
        )}
      </div>

      {/* Eval set status */}
      <div className="ragas-setup-card">
        <div className="ragas-setup-header">
          <span className="ragas-setup-title">Evaluation Dataset</span>
          <span className={'ragas-setup-badge ' + (evalSet?.exists ? 'ragas-badge-ok' : 'ragas-badge-missing')}>
            {evalSet?.exists ? evalSet.count + ' questions' : 'Not generated'}
          </span>
        </div>
        {evalSet?.exists && evalSet.generatedAt && (
          <p className="ragas-setup-meta">
            Generated {new Date(evalSet.generatedAt).toLocaleDateString()}
            {evalSet.sections && evalSet.sections.length > 0 && (
              <> · {evalSet.sections.length} sections covered</>
            )}
          </p>
        )}
        <p className="ragas-setup-hint">
          Synthetic Q&A pairs are generated from your indexed documents.
          Re-generate after major ingestion changes.
        </p>
        <button
          className="ragas-btn ragas-btn-secondary"
          onClick={handleGenerate}
          disabled={!!busy}
        >
          {data?.generating ? 'Generating…' : evalSet?.exists ? 'Re-generate Test Set' : 'Generate Test Set (30 Q&As)'}
        </button>
      </div>

      {/* Progress indicator */}
      {busy && progress && (
        <div className="ragas-progress">
          <div className="ragas-progress-bar-wrap">
            <div
              className="ragas-progress-bar-fill"
              style={{ width: `${Math.round((progress.done / progress.total) * 100)}%` }}
            />
          </div>
          <span className="ragas-progress-label">
            {progress.step === 'generate' ? 'Generating' : 'Evaluating'} {progress.done}/{progress.total}
            {progress.currentQuestion && <> · "{progress.currentQuestion}"</>}
          </span>
        </div>
      )}

      {/* Run evaluation */}
      {evalSet?.exists && (
        <div className="ragas-run-card">
          <p className="ragas-run-hint">
            Evaluation runs {evalSet.count} questions through the full retrieval pipeline and scores each with LLM judges. Takes 5–15 minutes.
          </p>
          <button
            className="ragas-btn ragas-btn-primary"
            onClick={handleRun}
            disabled={!!busy}
          >
            {data?.evaluating ? 'Running evaluation…' : 'Run Evaluation'}
          </button>
        </div>
      )}

      {/* History */}
      {data?.history && data.history.length > 0 && (
        <div className="ragas-history">
          <h3 className="ragas-section-title">Run History</h3>
          {[...data.history].reverse().map((run, i) => (
            <RunCard key={run.ts} run={run} index={data.history.length - 1 - i} />
          ))}
        </div>
      )}
    </div>
  )
}
