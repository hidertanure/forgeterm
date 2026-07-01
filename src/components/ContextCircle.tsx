export function ContextCircle({ size, percent, running, accentColor, activityStatus }: {
  size: number
  percent?: number
  running: boolean
  accentColor: string
  activityStatus: 'idle' | 'working' | 'unread'
}) {
  const hasContext = percent != null && percent > 0
  const r = 7
  const circumference = 2 * Math.PI * r
  const offset = hasContext ? circumference * (1 - percent / 100) : circumference

  const isWorking = activityStatus === 'working'
  const isUnread = activityStatus === 'unread'
  const dotColor = isWorking ? '#4ade80' : isUnread ? '#f87171' : accentColor
  const contextColor = hasContext && percent > 80 ? '#f87171' : hasContext && percent > 60 ? '#fbbf24' : accentColor
  const ringColor = isWorking ? '#4ade80' : isUnread ? '#f87171' : contextColor

  const className = `context-circle${isWorking ? ' activity-working' : isUnread ? ' activity-unread' : ''}`

  return (
    <svg width={size} height={size} viewBox="0 0 20 20" className={className} style={{ flexShrink: 0 }}>
      {hasContext && (
        <circle
          cx="10" cy="10" r={r}
          fill="none"
          stroke={ringColor}
          strokeWidth="2.5"
          opacity="0.15"
        />
      )}
      {hasContext && !isWorking && (
        <circle
          cx="10" cy="10" r={r}
          fill="none"
          stroke={ringColor}
          strokeWidth="2.5"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          opacity="0.85"
          style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'stroke-dashoffset 0.6s ease' }}
        />
      )}
      {isWorking && (
        <circle
          className="context-spinner"
          cx="10" cy="10" r={r}
          fill="none"
          stroke="#4ade80"
          strokeWidth="2.5"
          strokeDasharray={`${circumference * 0.25} ${circumference * 0.75}`}
          strokeLinecap="round"
        />
      )}
      {running ? (
        <circle cx="10" cy="10" r={hasContext ? 3 : 3.5} fill={dotColor} />
      ) : (
        <circle cx="10" cy="10" r={hasContext ? 3 : 3.5} fill="none" stroke={dotColor} strokeWidth="1.5" opacity="0.4" />
      )}
    </svg>
  )
}
