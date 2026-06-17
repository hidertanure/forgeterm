import { useState, useEffect, useRef, useCallback, useMemo, type KeyboardEvent } from 'react'
import type { Session } from '../store/sessionStore'
import { searchAllTerminals, getSessionLastOutput } from './TerminalView'

interface GlobalSearchProps {
  sessions: Session[]
  accentColor: string
  onReveal: (sessionId: string, line: number, col: number, length: number) => void
  onClose: () => void
}

const MAX_PER_SESSION = 6

interface Match {
  line: number
  col: number
  preview: string
}

interface Group {
  sessionId: string
  sessionName: string
  matches: Match[]
  total: number
}

interface FlatRow {
  sessionId: string
  line: number
  col: number
}

// Render a one-line preview windowed around the match, with the matched term
// highlighted. `col` is an index into `preview`.
function Snippet({ preview, col, length }: { preview: string; col: number; length: number }) {
  const winStart = Math.max(0, col - 28)
  let before = preview.slice(winStart, col)
  if (winStart === 0) before = before.replace(/^\s+/, '')
  const lead = winStart > 0 ? '…' : ''
  const match = preview.slice(col, col + length)
  const after = preview.slice(col + length, col + length + 160)
  return (
    <span className="global-search-snippet">
      {lead}{before}<mark className="global-search-match">{match}</mark>{after}
    </span>
  )
}

export function GlobalSearch({ sessions, accentColor, onReveal, onClose }: GlobalSearchProps) {
  const [query, setQuery] = useState('')
  const [debounced, setDebounced] = useState('')
  const [selected, setSelected] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const selectedRef = useRef<HTMLButtonElement>(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  // Debounce before scanning buffers - the scan is synchronous over scrollback.
  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), 120)
    return () => clearTimeout(t)
  }, [query])

  const groups = useMemo<Group[]>(() => {
    if (!debounced) return []
    const order = new Map(sessions.map((s, i) => [s.id, i]))
    const nameOf = new Map(sessions.map((s) => [s.id, s.name]))
    const raw = searchAllTerminals(debounced)
    const result: Group[] = []
    for (const [sessionId, matches] of raw) {
      result.push({
        sessionId,
        sessionName: nameOf.get(sessionId) ?? 'session',
        matches: matches.slice(0, MAX_PER_SESSION).map((m) => ({ line: m.line, col: m.col, preview: m.preview })),
        total: matches.length,
      })
    }
    // Rank sessions by most-recent output, then by sidebar order. Matches within
    // a session are already most-recent-first (searchAllTerminals scans bottom-up).
    result.sort((a, b) => {
      const ra = getSessionLastOutput(a.sessionId)
      const rb = getSessionLastOutput(b.sessionId)
      if (rb !== ra) return rb - ra
      return (order.get(a.sessionId) ?? 0) - (order.get(b.sessionId) ?? 0)
    })
    return result
  }, [debounced, sessions])

  const flat = useMemo<FlatRow[]>(() => {
    const rows: FlatRow[] = []
    for (const g of groups) {
      for (const m of g.matches) rows.push({ sessionId: g.sessionId, line: m.line, col: m.col })
    }
    return rows
  }, [groups])

  // Reset selection whenever the result set changes.
  useEffect(() => { setSelected(0) }, [flat.length])

  useEffect(() => {
    selectedRef.current?.scrollIntoView({ block: 'nearest' })
  }, [selected])

  const revealRow = useCallback((row: FlatRow) => {
    onReveal(row.sessionId, row.line, row.col, debounced.length)
  }, [onReveal, debounced])

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') { e.preventDefault(); onClose(); return }
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelected((s) => Math.min(s + 1, flat.length - 1)); return }
    if (e.key === 'ArrowUp') { e.preventDefault(); setSelected((s) => Math.max(s - 1, 0)); return }
    if (e.key === 'Enter') {
      e.preventDefault()
      const row = flat[selected]
      if (row) revealRow(row)
    }
  }, [flat, selected, revealRow, onClose])

  // Prefix-sum offsets so each rendered match knows its flat-list index.
  const offsets: number[] = []
  {
    let acc = 0
    for (const g of groups) { offsets.push(acc); acc += g.matches.length }
  }

  return (
    <div className="global-search-overlay" onClick={onClose}>
      <div className="global-search-modal" onClick={(e) => e.stopPropagation()}>
        <div className="global-search-input-row">
          <svg className="global-search-icon" width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="7" cy="7" r="4.5" />
            <line x1="10.5" y1="10.5" x2="14" y2="14" />
          </svg>
          <input
            ref={inputRef}
            className="global-search-input"
            type="text"
            placeholder="Search all open sessions..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <kbd className="global-search-kbd">esc</kbd>
        </div>

        <div className="global-search-results">
          {!debounced && (
            <div className="global-search-empty">Type to search the scrollback of every open session.</div>
          )}
          {debounced && flat.length === 0 && (
            <div className="global-search-empty">No matches for &ldquo;{debounced}&rdquo;.</div>
          )}
          {groups.map((g, gi) => (
            <div className="global-search-group" key={g.sessionId}>
              <div className="global-search-group-header">
                <span className="global-search-group-name">{g.sessionName}</span>
                <span className="global-search-group-count">{g.total} match{g.total === 1 ? '' : 'es'}</span>
              </div>
              {g.matches.map((m, j) => {
                const idx = offsets[gi] + j
                const isSel = idx === selected
                return (
                  <button
                    key={`${g.sessionId}-${m.line}-${j}`}
                    ref={isSel ? selectedRef : undefined}
                    className={`global-search-result${isSel ? ' selected' : ''}`}
                    style={isSel ? { borderColor: accentColor } : undefined}
                    onClick={() => revealRow({ sessionId: g.sessionId, line: m.line, col: m.col })}
                    onMouseEnter={() => setSelected(idx)}
                  >
                    <Snippet preview={m.preview} col={m.col} length={debounced.length} />
                  </button>
                )
              })}
              {g.total > g.matches.length && (
                <div className="global-search-more">+{g.total - g.matches.length} more in this session</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
