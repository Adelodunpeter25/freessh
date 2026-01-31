import { Home, X } from "lucide-react"
import { useConnectionStore } from "@/stores/connectionStore"
import { useOSTypeStore } from "@/stores/osTypeStore"
import { getOSIcon } from "@/utils/osIcons"
import { Button } from "@/components/ui/button"

interface PanelSelectorProps {
  onSelect: (type: 'local' | 'remote', connectionId?: string) => void
  onCancel: () => void
}

export function PanelSelector({ onSelect, onCancel }: PanelSelectorProps) {
  const connections = useConnectionStore((state) => state.connections)
  const getOSType = useOSTypeStore((state) => state.getOSType)

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="text-lg font-semibold">Select Source</h3>
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <X className="w-4 h-4" />
        </Button>
      </div>
      
      <div className="flex-1 overflow-auto p-4 space-y-2">
        <button
          onClick={() => onSelect('local')}
          className="w-full p-4 rounded-lg border border-border bg-card hover:bg-accent hover:scale-[1.02] transition-all cursor-pointer flex items-center gap-4"
        >
          <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center shrink-0">
            <Home className="w-5 h-5" />
          </div>
          <div className="flex flex-col items-start">
            <span className="font-medium">Local</span>
            <span className="text-sm text-muted-foreground">Browse local files</span>
          </div>
        </button>

        {connections.map((connection) => {
          const osType = getOSType(connection.id)
          const OSIcon = getOSIcon(osType)
          
          return (
            <button
              key={connection.id}
              onClick={() => onSelect('remote', connection.id)}
              className="w-full p-4 rounded-lg border border-border bg-card hover:bg-accent hover:scale-[1.02] transition-all cursor-pointer flex items-center gap-4"
            >
              <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center shrink-0">
                <OSIcon className="w-5 h-5" />
              </div>
              <div className="flex flex-col items-start">
                <span className="font-medium">{connection.name}</span>
                <span className="text-sm text-muted-foreground">
                  {connection.host}:{connection.port}
                </span>
              </div>
            </button>
          )
        })}

        {connections.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">
            No connections available
          </p>
        )}
      </div>
    </div>
  )
}
