import { useState, useCallback } from 'react'
import { useSessionStore } from '../store/sessionStore'
import { PanelTitleBar } from './PanelTitleBar'
import { TerminalView } from './TerminalView'
import type { ForgeTermConfig } from '../../shared/types'

interface GridPanelProps {
  sessionId: string
  isFocused: boolean
  accentColor: string
  config: ForgeTermConfig | null
  draggable: boolean
  onFocus: () => void
  onInfoToggle?: () => void
  onDrop: (e: React.DragEvent) => void
  onRename?: (id: string) => void
}

export function GridPanel({
  sessionId,
  isFocused,
  accentColor,
  config,
  draggable,
  onFocus,
  onInfoToggle,
  onDrop,
  onRename,
}: GridPanelProps) {
  const session = useSessionStore((s) => s.sessions.find((x) => x.id === sessionId))
  const renameRequestId = useSessionStore((s) => s.renameRequestId)
  const [dragging, setDragging] = useState(false)

  if (!session) return null

  const handleDragStart = useCallback((e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', sessionId)
    e.dataTransfer.effectAllowed = 'move'
    setDragging(true)
  }, [sessionId])

  const handleDragEnd = useCallback(() => {
    setDragging(false)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }, [])

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    if (dragging) return
    e.currentTarget.classList.add('drop-target')
  }, [dragging])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    if (e.currentTarget.contains(e.relatedTarget as Node)) return
    e.currentTarget.classList.remove('drop-target')
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.currentTarget.classList.remove('drop-target')
    setDragging(false)
    onDrop(e)
  }, [onDrop])

  return (
    <div
      className={'grid-panel' + (isFocused ? ' focused' : '') + (dragging ? ' dragging' : '')}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <PanelTitleBar
        sessionId={sessionId}
        name={session.name}
        isFocused={isFocused}
        isRunning={session.running}
        activityStatus={session.activityStatus}
        contextPercent={session.contextPercent}
        accentColor={accentColor}
        draggable={draggable}
        renameRequested={renameRequestId === sessionId}
        onFocus={onFocus}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onInfoToggle={onInfoToggle}
        onRenameRequest={onRename}
      />
      <TerminalView
        sessionId={sessionId}
        active={isFocused}
        config={config}
        variant="grid"
        onFocus={onFocus}
      />
    </div>
  )
}
