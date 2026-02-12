import { Fragment } from 'react'
import { cn } from '@/lib/utils'
import type { WorkspacePane, WorkspaceSplitViewProps } from './types'

function PaneNode({ pane, renderPane }: { pane: WorkspacePane; renderPane: WorkspaceSplitViewProps['renderPane'] }) {
  if (!pane.children || pane.children.length === 0) {
    return <Fragment>{renderPane(pane)}</Fragment>
  }

  const isHorizontal = pane.direction === 'horizontal'

  return (
    <div className={cn('flex h-full w-full gap-2', isHorizontal ? 'flex-row' : 'flex-col')}>
      {pane.children.map((child) => (
        <div key={child.id} className="min-h-0 min-w-0 flex-1">
          <PaneNode pane={child} renderPane={renderPane} />
        </div>
      ))}
    </div>
  )
}

export function WorkspaceSplitView({ panes, renderPane }: WorkspaceSplitViewProps) {
  if (panes.length === 0) {
    return <div className="h-full w-full" />
  }

  return (
    <div className="h-full w-full p-2">
      <div className="h-full w-full">
        {panes.map((pane) => (
          <div key={pane.id} className="h-full w-full">
            <PaneNode pane={pane} renderPane={renderPane} />
          </div>
        ))}
      </div>
    </div>
  )
}
