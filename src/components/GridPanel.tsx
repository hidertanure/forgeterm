import { useSessionStore } from '../store/sessionStore'
import { PanelTitleBar } from './PanelTitleBar'
import { TerminalView } from './TerminalView'
import type { ForgeTermConfig } from '../../shared/types'

interface GridPanelProps {
  sessionId: string
  isFocused: boolean
  accentColor: string
  config: ForgeTermConfig | null
  onFocus: () => void
  onInfoToggle?: () => void
  onDrop: (e: React.DragEvent) => void
}

export function GridPanel({
  sessionId,
  isFocused,
  accentColor,
  config,
  onFocus,
  onInfoToggle,
  onDrop,
}: GridPanelProps) {
  const session = useSessionStore((s) => s.sessions.find((x) => x.id === sessionId))

  if (!session) return null

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', sessionId)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    e.currentTarget.classList.add('drop-target')
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('drop-target')
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.currentTarget.classList.remove('drop-target')
    onDrop(e)
  }

  return (
    <div
      className={'grid-panel' + (isFocused ? ' focused' : '')}
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
        onFocus={onFocus}
        onDragStart={handleDragStart}
        onInfoToggle={onInfoToggle}
      />
      <TerminalView
        sessionId={sessionId}
        active={isFocused}
        config={config}
        variant="grid"
      />
    </div>
  )
}
