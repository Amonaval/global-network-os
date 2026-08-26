import { useState, useRef, useEffect } from 'react'
import { useSections, useUsers } from '../../hooks/useApi'
import type { InsightsFilters } from '../../types'

interface Props {
  filters: InsightsFilters
  onChange: (f: InsightsFilters) => void
  totalUnfiltered?: number
  filteredCount?: number
}

const DEFAULT_FILTERS: InsightsFilters = {
  window: 'all', last: 0, section: '', status: 'all', keyword: '', userId: '',
}

function isActive(f: InsightsFilters): boolean {
  return f.window !== 'all' || f.last > 0 || f.section !== '' || f.status !== 'all' || f.keyword !== '' || f.userId !== ''
}

// ── Pill selector ─────────────────────────────────────────────────────────────

function PillGroup<T extends string | number>({
  label, options, value, onChange,
}: {
  label: string
  options: { label: string; value: T }[]
  value: T
  onChange: (v: T) => void
}) {
  return (
    <div className="fb-group">
      <span className="fb-group-label">{label}</span>
      <div className="fb-pills">
        {options.map(o => (
          <button
            key={String(o.value)}
            className={`fb-pill${value === o.value ? ' active' : ''}`}
            onClick={() => onChange(o.value)}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Section dropdown ──────────────────────────────────────────────────────────

function SectionPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const { data } = useSections()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const sections = data?.sections ?? []

  useEffect(() => {
    if (!open) return
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [open])

  const label = value || 'All sections'

  return (
    <div className="fb-group">
      <span className="fb-group-label">Section</span>
      <div className="fb-dropdown-wrap" ref={ref}>
        <button
          className={`fb-dropdown-btn${value ? ' active' : ''}`}
          onClick={() => setOpen(o => !o)}
        >
          <span className="fb-dropdown-label">{label}</span>
          <span className="fb-dropdown-chevron">{open ? '▲' : '▼'}</span>
        </button>
        {open && (
          <div className="fb-dropdown-menu">
            <button
              className={`fb-dropdown-item${!value ? ' active' : ''}`}
              onClick={() => { onChange(''); setOpen(false) }}
            >
              All sections
            </button>
            {sections.map(s => (
              <button
                key={s.section}
                className={`fb-dropdown-item${value === s.section ? ' active' : ''}`}
                onClick={() => { onChange(s.section); setOpen(false) }}
              >
                {s.section}
                <span className="fb-dropdown-count">{s.chunks}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── User dropdown ─────────────────────────────────────────────────────────────

function UserPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const { data } = useUsers(true)
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const users = data?.users ?? []

  useEffect(() => {
    if (!open) return
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [open])

  const label = value || 'All users'

  return (
    <div className="fb-group">
      <span className="fb-group-label">User</span>
      <div className="fb-dropdown-wrap" ref={ref}>
        <button
          className={`fb-dropdown-btn${value ? ' active' : ''}`}
          onClick={() => setOpen(o => !o)}
        >
          <span className="fb-dropdown-label">{label}</span>
          <span className="fb-dropdown-chevron">{open ? '▲' : '▼'}</span>
        </button>
        {open && (
          <div className="fb-dropdown-menu">
            <button
              className={`fb-dropdown-item${!value ? ' active' : ''}`}
              onClick={() => { onChange(''); setOpen(false) }}
            >
              All users
            </button>
            {users.map(u => (
              <button
                key={u.userId}
                className={`fb-dropdown-item${value === u.userId ? ' active' : ''}`}
                onClick={() => { onChange(u.userId); setOpen(false) }}
              >
                {u.userId}
                <span className="fb-dropdown-count">{u.queryCount}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Keyword input ─────────────────────────────────────────────────────────────

function KeywordInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="fb-group">
      <span className="fb-group-label">Keyword</span>
      <div className="fb-keyword-wrap">
        <input
          className="fb-keyword-input"
          type="text"
          placeholder="filter queries…"
          value={value}
          onChange={e => onChange(e.target.value)}
        />
        {value && (
          <button className="fb-keyword-clear" onClick={() => onChange('')}>×</button>
        )}
      </div>
    </div>
  )
}

// ── Main FilterBar ────────────────────────────────────────────────────────────

export function FilterBar({ filters, onChange, totalUnfiltered, filteredCount }: Props) {
  const active = isActive(filters)
  const showing = filteredCount !== undefined && totalUnfiltered !== undefined && active

  return (
    <div className={`fb-root${active ? ' fb-active' : ''}`}>
      <div className="fb-controls">

        <PillGroup
          label="Time"
          value={filters.window}
          onChange={v => onChange({ ...filters, window: v, last: 0 })}
          options={[
            { label: 'All', value: 'all' },
            { label: '7d',  value: '7d'  },
            { label: '30d', value: '30d' },
            { label: '90d', value: '90d' },
            { label: '180d', value: '180d' },
          ]}
        />

        <PillGroup
          label="Last N queries"
          value={filters.last}
          onChange={v => onChange({ ...filters, last: v, window: 'all' })}
          options={[
            { label: 'All',  value: 0   },
            { label: '5',    value: 5   },
            { label: '10',   value: 10  },
            { label: '25',   value: 25  },
            { label: '50',   value: 50  },
            { label: '100',  value: 100 },
          ]}
        />

        <PillGroup
          label="Status"
          value={filters.status}
          onChange={v => onChange({ ...filters, status: v })}
          options={[
            { label: 'All',         value: 'all'        },
            { label: 'Answered',    value: 'answered'   },
            { label: 'Unanswered',  value: 'unanswered' },
          ]}
        />

        <SectionPicker
          value={filters.section}
          onChange={v => onChange({ ...filters, section: v })}
        />

        <UserPicker
          value={filters.userId}
          onChange={v => onChange({ ...filters, userId: v })}
        />

        <KeywordInput
          value={filters.keyword}
          onChange={v => onChange({ ...filters, keyword: v })}
        />

      </div>

      <div className="fb-footer">
        {showing && (
          <span className="fb-showing">
            Showing <strong>{filteredCount}</strong> of {totalUnfiltered} queries
          </span>
        )}
        {active && (
          <button className="fb-clear" onClick={() => onChange(DEFAULT_FILTERS)}>
            × Clear filters
          </button>
        )}
      </div>
    </div>
  )
}

export { DEFAULT_FILTERS }
