import { ArrowRight, Pencil, Trash2, Play, Square } from 'lucide-react'
import { PortForwardConfig } from '@/types'

interface TunnelCardProps {
  config: PortForwardConfig
  connectionName?: string
  isActive: boolean
  onStart: (id: string) => void
  onStop: (id: string) => void
  onEdit: (config: PortForwardConfig) => void
  onDelete: (id: string) => void
}

export function TunnelCard({ config, connectionName, isActive, onStart, onStop, onEdit, onDelete }: TunnelCardProps) {
  return (
    <div className="p-4 border rounded-lg hover:border-primary/50 transition-colors bg-card">
      <div className="flex items-start justify-between gap-3">
        {/* Type Icon */}
        <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg ${
          isActive 
            ? 'bg-green-500/10 text-green-500' 
            : 'bg-muted text-muted-foreground'
        }`}>
          {config.type === 'local' ? 'L' : 'R'}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium truncate">{config.name}</h3>
          <p className="text-xs text-muted-foreground mb-2">{connectionName || 'Unknown connection'}</p>
          
          <div className="flex items-center gap-2 text-sm font-mono">
            {config.type === 'local' ? (
              <>
                <span>{config.binding_address}:{config.local_port}</span>
                <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <span className="truncate">{config.remote_host}:{config.remote_port}</span>
              </>
            ) : (
              <>
                <span>remote:{config.remote_port}</span>
                <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <span className="truncate">{config.remote_host}:{config.local_port}</span>
              </>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => isActive ? onStop(config.id) : onStart(config.id)}
            className={`p-1.5 rounded transition-colors ${
              isActive
                ? 'hover:bg-red-500/10 hover:text-red-500'
                : 'hover:bg-green-500/10 hover:text-green-500'
            }`}
            title={isActive ? 'Stop tunnel' : 'Start tunnel'}
          >
            {isActive ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <button
            onClick={() => onEdit(config)}
            className="p-1.5 hover:bg-muted rounded transition-colors"
            title="Edit"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(config.id)}
            className="p-1.5 hover:bg-destructive/10 hover:text-destructive rounded transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
