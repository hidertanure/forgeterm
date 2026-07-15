import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import type { HistoricalSession } from '../../shared/types'

interface SessionPreset {
  name: string
  command?: string
}

type SortField = 'closed' | 'opened'
type SortDir = 'desc' | 'asc'

interface NewSessionModalProps {
  accentColor: string
  presets: SessionPreset[]
  projectPath: string
  /** Conversation ids currently open - excluded from the recent-sessions list. */
  openConversationIds: string[]
  onSubmit: (name: string, command?: string, addToStartup?: boolean) => void
  onReopen: (session: HistoricalSession) => void
  onCancel: () => void
}

function formatWhen(ts: number): string {
  const date = new Date(ts)
  const now = new Date()
  const isToday = date.toDateString() === now.toDateString()
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  const isYesterday = date.toDateString() === yesterday.toDateString()
  const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  if (isToday) return `Today ${time}`
  if (isYesterday) return `Yesterday ${time}`
  return `${date.toLocaleDateString([], { month: 'short', day: 'numeric' })} ${time}`
}

export function NewSessionModal({ accentColor, presets, projectPath, openConversationIds, onSubmit, onReopen, onCancel }: NewSessionModalProps) {
  const [name, setName] = useState('')
  const [command, setCommand] = useState('')
  const [addToStartup, setAddToStartup] = useState(false)
  const [history, setHistory] = useState<HistoricalSession[]>([])
  const [sortField, setSortField] = useState<SortField>('closed')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Stable key so the load effect doesn't re-fire on every parent re-render
  // (openConversationIds is a fresh array reference each render).
  const openKey = openConversationIds.join(',')

  // Load this project's closed sessions. Dedup by conversation (latest per
  // conversationId, else per id) and drop conversations that are currently open.
  useEffect(() => {
    if (!projectPath) return
    let cancelled = false
    window.forgeterm.getSessionHistory(projectPath).then((sessions) => {
      if (cancelled) return
      const openSet = new Set(openKey ? openKey.split(',') : [])
      const byKey = new Map<string, HistoricalSession>()
      for (const s of sessions) {
        if (s.conversationId && openSet.has(s.conversationId)) continue
        const key = s.conversationId ? `c:${s.conversationId}` : `i:${s.id}`
        const prev = byKey.get(key)
        if (!prev || (s.endedAt ?? s.createdAt) > (prev.endedAt ?? prev.createdAt)) byKey.set(key, s)
      }
      setHistory([...byKey.values()])
    })
    return () => { cancelled = true }
  }, [projectPath, openKey])

  // Timestamp the current sort keys on: close time (endedAt) or open time (createdAt).
  const whenOf = useCallback(
    (s: HistoricalSession) => (sortField === 'opened' ? s.createdAt : (s.endedAt ?? s.createdAt)),
    [sortField],
  )

  const sorted = useMemo(() => {
    const arr = [...history].sort((a, b) => whenOf(a) - whenOf(b))
    if (sortDir === 'desc') arr.reverse()
    return arr
  }, [history, sortDir, whenOf])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const sessionName = name.trim() || 'shell'
    onSubmit(sessionName, command.trim() || undefined, addToStartup)
  }

  const handlePresetClick = useCallback((preset: SessionPreset) => {
    onSubmit(preset.name, preset.command)
  }, [onSubmit])

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal new-session-modal" onClick={(e) => e.stopPropagation()}>
        <h3>New Session</h3>

        <form className="new-session-form" onSubmit={handleSubmit}>
          <div className="new-session-scroll">
            {sorted.length > 0 && (
              <div className="session-history-section">
                <div className="session-history-head">
                  <div className="presets-label">Recent sessions</div>
                  <div className="session-sort-controls">
                    <div className="session-sort-group">
                      <button
                        type="button"
                        className={`session-sort-field${sortField === 'closed' ? ' active' : ''}`}
                        onClick={() => setSortField('closed')}
                      >
                        Closed
                      </button>
                      <button
                        type="button"
                        className={`session-sort-field${sortField === 'opened' ? ' active' : ''}`}
                        onClick={() => setSortField('opened')}
                      >
                        Opened
                      </button>
                    </div>
                    <button
                      type="button"
                      className="session-sort-dir"
                      onClick={() => setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'))}
                      title={sortDir === 'desc' ? 'Newest first — click for oldest' : 'Oldest first — click for newest'}
                    >
                      {sortDir === 'desc' ? '↓ Newest' : '↑ Oldest'}
                    </button>
                  </div>
                </div>
                <div className="session-history-list">
                  {sorted.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      className="history-btn"
                      onClick={() => onReopen(s)}
                      style={{ borderColor: accentColor + '44' }}
                    >
                      <span className="history-btn-main">
                        <span className="preset-name">{s.name}</span>
                        {s.conversationId && <span className="project-history-claude-tag">Claude</span>}
                      </span>
                      <span className="history-btn-date">
                        {sortField === 'opened' ? 'opened ' : 'closed '}{formatWhen(whenOf(s))}
                      </span>
                    </button>
                  ))}
                </div>
                <div className="presets-divider">
                  <span>{presets.length > 0 ? 'or from project config' : 'or start new'}</span>
                </div>
              </div>
            )}

            {presets.length > 0 && (
              <div className="session-presets">
                <div className="presets-label">From project config</div>
                <div className="presets-list">
                  {presets.map((preset, i) => (
                    <button
                      key={i}
                      type="button"
                      className="preset-btn"
                      onClick={() => handlePresetClick(preset)}
                      style={{ borderColor: accentColor + '44' }}
                    >
                      <span className="preset-name">{preset.name}</span>
                      {preset.command && (
                        <span className="preset-command">{preset.command}</span>
                      )}
                    </button>
                  ))}
                </div>
                <div className="presets-divider">
                  <span>or create custom</span>
                </div>
              </div>
            )}

            <div className="form-field">
              <label>Name</label>
              <input
                ref={inputRef}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="shell"
              />
            </div>
            <div className="form-field">
              <label>Command (optional)</label>
              <input
                type="text"
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                placeholder="e.g. npm run dev"
              />
            </div>
            <label className="add-to-startup-toggle">
              <input
                type="checkbox"
                checked={addToStartup}
                onChange={(e) => setAddToStartup(e.target.checked)}
              />
              <span>Add to project startup sessions</span>
            </label>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onCancel}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn-create"
              style={{ backgroundColor: accentColor }}
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
