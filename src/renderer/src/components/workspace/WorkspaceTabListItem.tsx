import { Monitor } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { WorkspaceTabListItemProps } from './types'
import { useOSTypeStore } from '@/stores/osTypeStore'
import { getOSIcon } from '@/utils/osIcons'

export function WorkspaceTabListItem({ tab, active = false, onSelect }: WorkspaceTabListItemProps) {
  const osType = useOSTypeStore((state) => state.getOSType(tab.connectionId || ''))
  const OSIcon = tab.isLocal ? Monitor : getOSIcon(osType)

  return (
    <button
      type="button"
      onClick={() => onSelect?.(tab.sessionId)}
      className={cn(
        'flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition-colors',
        active ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/60',
      )}
    >
      <span className="flex min-w-0 items-center gap-2">
        <OSIcon className="h-4 w-4 shrink-0" />
        <span className="truncate">{tab.title}</span>
      </span>
      <span className="text-xs text-muted-foreground">{tab.subtitle}</span>
    </button>
  )
}
