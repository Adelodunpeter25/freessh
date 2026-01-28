import { ArrowRight, Pencil, Trash2, Play, Square } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { PortForwardConfig } from '@/types'

interface TunnelCardProps {
  config: PortForwardConfig
  connectionName?: string
  isActive: boolean
  selected: boolean
  onStart: (id: string) => void
  onStop: (id: string) => void
  onEdit: (config: PortForwardConfig) => void
  onDelete: (id: string) => void
  onSelect: (id: string) => void
}

export function TunnelCard({ config, connectionName, isActive, selected, onStart, onStop, onEdit, onDelete, onSelect }: TunnelCardProps) {
  return (
    <div 
      onClick={() => onSelect(config.id)}
      className={`p-3 border rounded-lg transition-all cursor-pointer bg-card hover:shadow-md hover:scale-[1.02] ${
        selected ? 'border-primary ring-2 ring-primary/20' : 'hover:border-primary/50'
      }`}
    >
      <div className="flex items-start gap-1.5">
        {/* Type Icon */}
        <div className={`flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center font-bold text-base ${
          isActive 
            ? 'bg-green-500/20 text-green-500 ring-2 ring-green-500/30' 
            : 'bg-muted text-muted-foreground'
        }`}>
          {config.type === 'local' ? 'L' : 'R'}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium truncate text-sm">{config.name}</h3>
          <p className="text-xs text-muted-foreground mb-1">{connectionName || 'Unknown connection'}</p>
          
          <div className="flex items-center gap-1.5 text-xs font-mono">
            {config.type === 'local' ? (
              <>
                <span className="truncate">{config.binding_address}:{config.local_port}</span>
                <ArrowRight className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                <span className="truncate">{config.remote_host}:{config.remote_port}</span>
              </>
            ) : (
              <>
                <span className="truncate">remote:{config.remote_port}</span>
                <ArrowRight className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                <span className="truncate">{config.remote_host}:{config.local_port}</span>
              </>
            )}
          </div>
        </div>

        {/* Actions */}
        <TooltipProvider delayDuration={150}>
          <div className="flex items-center gap-0.5 flex-shrink-0 ml-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    isActive ? onStop(config.id) : onStart(config.id)
                  }}
                  className={`p-1.5 rounded transition-colors ${
                    isActive
                      ? 'hover:bg-red-500/10 hover:text-red-500'
                      : 'hover:bg-green-500/10 hover:text-green-500'
                  }`}
                >
                  {isActive ? <Square className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                </button>
              </TooltipTrigger>
              <TooltipContent>{isActive ? 'Stop tunnel' : 'Start tunnel'}</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onEdit(config)
                  }}
                  className="p-1.5 hover:bg-muted rounded transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent>Edit</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete(config.id)
                  }}
                  className="p-1.5 hover:bg-destructive/10 hover:text-destructive rounded transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent>Delete</TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </div>
    </div>
  )
}
