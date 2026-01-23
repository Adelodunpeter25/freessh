import { memo } from 'react'
import { Server, Pencil } from 'lucide-react'
import { ConnectionConfig } from '@/types'
import { ConnectionCardContextMenu } from '@/components/contextmenu'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

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
  return (
    <ConnectionCardContextMenu
      connection={connection}
      onConnect={() => onConnect(connection)}
      onOpenSFTP={() => onOpenSFTP(connection)}
      onEdit={() => onEdit(connection)}
      onDelete={() => onDelete(connection.id)}
    >
      <div
        className={`group flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer select-none ${
          selected 
            ? 'bg-card border-primary shadow-[0_0_0_2px_hsl(var(--primary))]' 
            : 'bg-card border-border hover:bg-muted/50 shadow-sm hover:shadow-md'
        }`}
        onClick={(e) => {
          e.stopPropagation()
          onSelect(connection)
        }}
        onDoubleClick={() => onConnect(connection)}
      >
        <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
          <Server className="h-5 w-5 text-primary" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-foreground truncate">{connection.name}</h3>
          <p className="text-xs text-muted-foreground truncate">
            {connection.username}@{connection.host}:{connection.port}
          </p>
        </div>

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
      </div>
    </ConnectionCardContextMenu>
  )
})
