import { cn } from '@/lib/utils'
import type { WorkspaceDropZoneProps } from './types'

export function WorkspaceDropZone({
  label = 'Drop terminal tab',
  description = 'Drag a terminal tab here to move it into this workspace.',
  active = false,
}: WorkspaceDropZoneProps) {
  return (
    <div
      className={cn(
        'flex h-full min-h-[160px] w-full flex-col items-center justify-center rounded-lg border border-dashed px-6 text-center transition-colors',
        active ? 'border-primary bg-primary/5' : 'border-border bg-muted/10',
      )}
    >
      <p className="text-sm font-medium text-foreground">{label}</p>
      <p className="mt-1 text-xs text-muted-foreground">{description}</p>
    </div>
  )
}
