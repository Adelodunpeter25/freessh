import { memo } from 'react'
import { Pencil, Loader2 } from 'lucide-react'
import { ConnectionConfig } from '@/types'
import { ConnectionCardContextMenu } from '@/components/contextmenu'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useOSTypeStore } from '@/stores/osTypeStore'
import { getOSIcon } from '@/utils/osIcons'

interface ConnectionCardProps {
  connection: ConnectionConfig
  selected: boolean
  loading: boolean
  onSelect: (connection: ConnectionConfig) => void
  onConnect: (connection: ConnectionConfig) => void
  onOpenSFTP: (connection: ConnectionConfig) => void
  onEdit: (connection: ConnectionConfig) => void
  onDelete: (id: string) => Promise<void>
}

export const ConnectionCard = memo(function ConnectionCard({ connection, selected, loading, onSelect, onConnect, onOpenSFTP, onEdit, onDelete }: ConnectionCardProps) {
  const osType = useOSTypeStore((state) => state.getOSType(connection.id))
  const OSIcon = getOSIcon(osType)
  
  return (
    <ConnectionCardContextMenu
      connection={connection}
      onConnect={() => onConnect(connection)}
      onOpenSFTP={() => onOpenSFTP(connection)}
      onEdit={() => onEdit(connection)}
      onDelete={() => onDelete(connection.id)}
    >
      <div
        className={`group flex items-center gap-4 p-4 rounded-xl border transition-all select-none animate-scale-in ${
          loading
            ? 'bg-card border-primary/50 shadow-[0_0_0_1px_hsl(var(--primary)/0.5)] cursor-wait'
            : selected 
              ? 'bg-card border-primary/50 shadow-[0_0_0_1px_hsl(var(--primary)/0.5)] cursor-pointer' 
              : 'bg-card border-border hover:bg-muted/50 shadow-sm hover:shadow-md cursor-pointer'
        }`}
        onClick={(e) => {
          e.stopPropagation()
          if (!loading) onSelect(connection)
        }}
        onContextMenu={(e) => {
          e.stopPropagation()
          if (!loading) onSelect(connection)
        }}
        onDoubleClick={() => {
          if (!loading) onConnect(connection)
        }}
      >
        <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
          {loading ? (
            <Loader2 className="h-5 w-5 text-primary animate-spin" />
          ) : (
            <OSIcon className="h-7 w-7 text-primary" />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-foreground truncate">{connection.name}</h3>
          <p className="text-xs text-muted-foreground truncate">
            {loading ? 'Connecting...' : `${connection.username}@${connection.host}:${connection.port}`}
          </p>
        </div>

        {!loading && (
          <TooltipProvider delayDuration={150}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="opacity-0 group-hover:opacity-100 h-8 w-8"
                  onClick={(e) => {
                    e.stopPropagation()
                    onEdit(connection)
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Edit details</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </ConnectionCardContextMenu>
  )
})
