import { Fragment, useCallback, useRef } from 'react'
import { Group, Panel, Separator } from 'react-resizable-panels'
import type { Layout } from 'react-resizable-panels'
import { useSessionStore } from '../store/sessionStore'
import { autoTile } from '../utils/autoTile'
import { GridPanel } from './GridPanel'
import type { ForgeTermConfig } from '../../shared/types'

interface GridLayoutProps {
  accentColor: string
  config: ForgeTermConfig | null
  onCombinedLayoutChange?: (layout: Layout) => void
  defaultLayout?: Layout
}

export function GridLayout({
  accentColor,
  config,
  onCombinedLayoutChange,
  defaultLayout,
}: GridLayoutProps) {
  const sessions = useSessionStore((s) => s.sessions)
  const activeSessionId = useSessionStore((s) => s.activeSessionId)
  const setActive = useSessionStore((s) => s.setActive)
  const swapGridPanels = useSessionStore((s) => s.swapGridPanels)

  const sessionIds = sessions.map((s) => s.id)
  const columns = autoTile(sessionIds)

  const innerLayoutsRef = useRef<Map<number, Layout>>(new Map())

  const handleInnerLayoutChange = useCallback(
    (colIdx: number, layout: Layout) => {
      innerLayoutsRef.current.set(colIdx, layout)
    },
    [],
  )

  const handleCombinedLayoutChange = useCallback(
    (layout: Layout) => {
      if (!onCombinedLayoutChange) return
      const combined: Layout = {}
      const colIds = columns.map((_, i) => `col-${i}`)
      for (const id of colIds) {
        combined[id] = layout[id] ?? 0
      }
      for (const [, innerLayout] of innerLayoutsRef.current) {
        Object.assign(combined, innerLayout)
      }
      onCombinedLayoutChange(combined)
    },
    [onCombinedLayoutChange, columns],
  )

  const handleDropSwap = useCallback(
    (fromId: string, toId: string) => {
      swapGridPanels(fromId, toId)
    },
    [swapGridPanels],
  )

  const handleDrop = useCallback(
    (targetId: string) => (e: React.DragEvent) => {
      const fromId = e.dataTransfer.getData('text/plain')
      if (fromId && fromId !== targetId) {
        handleDropSwap(fromId, targetId)
      }
    },
    [handleDropSwap],
  )

  return (
    <div className="grid-layout">
      <Group
        orientation="horizontal"
        onLayoutChange={handleCombinedLayoutChange}
        defaultLayout={defaultLayout}
      >
        {columns.map((col, colIdx) => (
          <Fragment key={colIdx}>
            {colIdx > 0 && <Separator />}
            <Panel id={`col-${colIdx}`} minSize={10}>
              <Group
                orientation="vertical"
                onLayoutChange={(layout) =>
                  handleInnerLayoutChange(colIdx, layout)
                }
              >
                {col.map((id, rowIdx) => (
                  <Fragment key={id}>
                    {rowIdx > 0 && <Separator />}
                    <Panel id={id} minSize={10}>
                      <GridPanel
                        sessionId={id}
                        isFocused={id === activeSessionId}
                        accentColor={accentColor}
                        config={config}
                        draggable={sessions.length > 1}
                        onFocus={() => setActive(id)}
                        onDrop={handleDrop(id)}
                      />
                    </Panel>
                  </Fragment>
                ))}
              </Group>
            </Panel>
          </Fragment>
        ))}
      </Group>
    </div>
  )
}
