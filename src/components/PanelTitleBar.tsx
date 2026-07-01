import { useState, useRef, useEffect } from 'react'
import type { SessionActivityStatus } from '../../shared/types'
import { useSessionStore } from '../store/sessionStore'
import { ContextCircle } from './ContextCircle'

interface PanelTitleBarProps {
  sessionId: string
  name: string
  isFocused: boolean
  isRunning: boolean
  activityStatus: SessionActivityStatus
  contextPercent?: number
  accentColor: string
  draggable?: boolean
  renameRequested?: boolean
  onFocus: () => void
  onDragStart: (e: React.DragEvent) => void
  onDragEnd?: () => void
  onInfoToggle?: () => void
  onRenameRequest?: (id: string) => void
}

export function PanelTitleBar({
  sessionId,
  name,
  isFocused,
  isRunning,
  activityStatus,
  contextPercent,
  accentColor,
  draggable = true,
  renameRequested = false,
  onFocus,
  onDragStart,
  onDragEnd,
  onInfoToggle,
  onRenameRequest,
}: PanelTitleBarProps) {
  const [editing, setEditing] = useState(false)
  const [editValue, setEditValue] = useState(name)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (renameRequested) {
      setEditValue(name)
      setEditing(true)
      useSessionStore.getState().clearRenameRequest()
    }
  }, [renameRequested, name])

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editing])

  const handleSubmitRename = () => {
    const trimmed = editValue.trim()
    if (trimmed && trimmed !== name) {
      useSessionStore.getState().renameSession(sessionId, trimmed)
      window.forgeterm.renameSession(sessionId, trimmed)
    }
    setEditing(false)
  }

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setEditValue(name)
    setEditing(true)
  }

  return (
    <div
      className={'panel-titlebar' + (isFocused ? ' focused' : '')}
      draggable={!editing && draggable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onFocus}
    >
      <span className="panel-titlebar-status">
        {isFocused && (
          <ContextCircle
            percent={contextPercent}
            activityStatus={activityStatus}
            running={isRunning}
            accentColor={accentColor}
            size={14}
          />
        )}
        {!isFocused && (
          <span
            className={'panel-titlebar-dot' + (isRunning ? ' running' : ' stopped')}
            style={{
              display: 'inline-block',
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: isRunning ? '#22c55e' : '#6b7280',
              flexShrink: 0,
            }}
          />
        )}
      </span>
      {editing ? (
        <input
          ref={inputRef}
          className="panel-titlebar-input"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleSubmitRename}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSubmitRename()
            if (e.key === 'Escape') setEditing(false)
          }}
          onClick={(e) => e.stopPropagation()}
          onDragStart={(e) => e.stopPropagation()}
        />
      ) : (
        <span className="panel-titlebar-name" onDoubleClick={handleDoubleClick}>{name}</span>
      )}
      {onInfoToggle && (
        <button
          className="panel-titlebar-info"
          onClick={(e) => {
            e.stopPropagation()
            onInfoToggle()
          }}
          title="Session info"
        >
          i
        </button>
      )}
    </div>
  )
}
