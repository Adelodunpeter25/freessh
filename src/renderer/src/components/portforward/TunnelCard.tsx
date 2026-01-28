import { ArrowRight, X } from 'lucide-react'
import { TunnelInfo } from '@/types'

interface TunnelCardProps {
  tunnel: TunnelInfo
  onStop: (id: string) => void
}

export function TunnelCard({ tunnel, onStop }: TunnelCardProps) {
  return (
    <div className="p-4 border rounded-lg hover:border-primary/50 transition-colors bg-card">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-medium px-2 py-1 rounded bg-primary/10 text-primary">
              {tunnel.type === 'local' ? 'Local' : 'Remote'}
            </span>
            <span className={`text-xs px-2 py-1 rounded ${
              tunnel.status === 'active' 
                ? 'bg-green-500/10 text-green-500' 
                : 'bg-red-500/10 text-red-500'
            }`}>
              {tunnel.status}
            </span>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            {tunnel.type === 'local' ? (
              <>
                <span className="font-mono">localhost:{tunnel.local_port}</span>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
                <span className="font-mono">{tunnel.remote_host}:{tunnel.remote_port}</span>
              </>
            ) : (
              <>
                <span className="font-mono">remote:{tunnel.remote_port}</span>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
                <span className="font-mono">{tunnel.remote_host}:{tunnel.local_port}</span>
              </>
            )}
          </div>

          {tunnel.error && (
            <p className="text-xs text-red-500 mt-2">{tunnel.error}</p>
          )}
        </div>

        <button
          onClick={() => onStop(tunnel.id)}
          className="p-1 hover:bg-destructive/10 hover:text-destructive rounded transition-colors"
          title="Stop tunnel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
