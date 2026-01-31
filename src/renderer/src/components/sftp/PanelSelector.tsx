import { Home, Server } from "lucide-react"
import { useConnectionStore } from "@/stores/connectionStore"

interface PanelSelectorProps {
  onSelect: (type: 'local' | 'remote', connectionId?: string) => void
}

export function PanelSelector({ onSelect }: PanelSelectorProps) {
  const connections = useConnectionStore((state) => state.connections)

  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 p-6">
      <button
        onClick={() => onSelect('local')}
        className="w-full max-w-md px-6 py-4 rounded-lg border border-border bg-accent hover:bg-accent/80 hover:scale-105 transition-all cursor-pointer flex items-center gap-3"
      >
        <Home className="w-5 h-5" />
        <span className="font-medium">Local</span>
      </button>

      {connections.map((connection) => (
        <button
          key={connection.id}
          onClick={() => onSelect('remote', connection.id)}
          className="w-full max-w-md px-6 py-4 rounded-lg border border-border bg-accent hover:bg-accent/80 hover:scale-105 transition-all cursor-pointer flex items-center gap-3"
        >
          <Server className="w-5 h-5" />
          <span className="font-medium">{connection.name}</span>
        </button>
      ))}

      {connections.length === 0 && (
        <p className="text-sm text-muted-foreground mt-4">
          No connections available
        </p>
      )}
    </div>
  )
}
