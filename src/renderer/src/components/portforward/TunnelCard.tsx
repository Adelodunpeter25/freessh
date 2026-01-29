import { ArrowRight, Play, Square } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { TunnelCardContextMenu } from '@/components/contextmenu/TunnelCardContextMenu'
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
    <TunnelCardContextMenu config={config} onEdit={onEdit} onDelete={onDelete}>
      <div 
        onClick={(e) => {
          e.stopPropagation()
          onSelect(config.id)
        }}
        onContextMenu={(e) => {
          e.stopPropagation()
          onSelect(config.id)
        }}
        className={`group flex items-center gap-2 p-3 rounded-xl border transition-all select-none cursor-pointer animate-scale-in ${
          selected 
            ? 'bg-card border-primary/50 shadow-[0_0_0_1px_hsl(var(--primary)/0.5)]' 
            : 'bg-card border-border hover:bg-muted/50 shadow-sm hover:shadow-md'
        }`}
      >
      {/* Type Icon */}
      <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg ${
        isActive 
          ? 'bg-green-500/20 text-green-500 ring-2 ring-green-500/30' 
          : 'bg-muted text-muted-foreground'
      }`}>
        {config.type === 'local' ? 'L' : config.type === 'remote' ? 'R' : 'D'}
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
          ) : config.type === 'remote' ? (
            <>
              <span className="truncate">remote:{config.remote_port}</span>
              <ArrowRight className="w-3 h-3 text-muted-foreground flex-shrink-0" />
              <span className="truncate">{config.remote_host}:{config.local_port}</span>
            </>
          ) : (
            <span className="truncate">SOCKS {config.binding_address}:{config.local_port}</span>
          )}
        </div>
      </div>

      {/* Actions */}
      <TooltipProvider delayDuration={150}>
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
      </TooltipProvider>
    </div>
    </TunnelCardContextMenu>
  )
}
