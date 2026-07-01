import type { SessionActivityStatus } from '../../shared/types'
import { ContextCircle } from './ContextCircle'

interface PanelTitleBarProps {
  sessionId: string
  name: string
  isFocused: boolean
  isRunning: boolean
  activityStatus: SessionActivityStatus
  contextPercent?: number
  accentColor: string
  onFocus: () => void
  onDragStart: (e: React.DragEvent) => void
  onInfoToggle?: () => void
}

export function PanelTitleBar({
  sessionId,
  name,
  isFocused,
  isRunning,
  activityStatus,
  contextPercent,
  accentColor,
  onFocus,
  onDragStart,
  onInfoToggle,
}: PanelTitleBarProps) {
  return (
    <div
      className={'panel-titlebar' + (isFocused ? ' focused' : '')}
      draggable
      onDragStart={onDragStart}
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
      <span className="panel-titlebar-name">{name}</span>
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
