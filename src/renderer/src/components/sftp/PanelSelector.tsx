import { Home, Server, X } from "lucide-react"
import { useConnectionStore } from "@/stores/connectionStore"
import { Button } from "@/components/ui/button"

interface PanelSelectorProps {
  onSelect: (type: 'local' | 'remote', connectionId?: string) => void
  onCancel: () => void
}

export function PanelSelector({ onSelect, onCancel }: PanelSelectorProps) {
  const connections = useConnectionStore((state) => state.connections)

  return (
    <div className="flex flex-col h-full p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Select Source</h3>
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <X className="w-4 h-4" />
        </Button>
      </div>
      
      <div className="flex-1 grid grid-cols-2 gap-4 overflow-auto">
        <button
          onClick={() => onSelect('local')}
          className="h-32 rounded-lg border border-border bg-accent hover:bg-accent/80 hover:scale-105 transition-all cursor-pointer flex flex-col items-center justify-center gap-3"
        >
          <Home className="w-8 h-8" />
          <span className="font-medium">Local</span>
        </button>

        {connections.map((connection) => (
          <button
            key={connection.id}
            onClick={() => onSelect('remote', connection.id)}
            className="h-32 rounded-lg border border-border bg-accent hover:bg-accent/80 hover:scale-105 transition-all cursor-pointer flex flex-col items-center justify-center gap-3"
          >
            <Server className="w-8 h-8" />
            <span className="font-medium text-center px-2">{connection.name}</span>
          </button>
        ))}
      </div>

      {connections.length === 0 && (
        <p className="text-sm text-muted-foreground text-center mt-4">
          No connections available
        </p>
      )}
    </div>
  )
}
