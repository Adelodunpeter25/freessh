import { Monitor, Server } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { WorkspaceTabListItemProps } from './types'

export function WorkspaceTabListItem({ tab, active = false, onSelect }: WorkspaceTabListItemProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect?.(tab.tab_id)}
      className={cn(
        'flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition-colors',
        active ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/60',
      )}
    >
      <span className="flex min-w-0 items-center gap-2">
        {tab.is_local ? <Monitor className="h-4 w-4 shrink-0" /> : <Server className="h-4 w-4 shrink-0" />}
        <span className="truncate">{tab.tab_id}</span>
      </span>
      <span className="text-xs text-muted-foreground">{tab.session_id}</span>
    </button>
  )
}
