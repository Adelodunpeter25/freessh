import { Home, X, Search } from "lucide-react"
import { useConnectionStore } from "@/stores/connectionStore"
import { useOSTypeStore } from "@/stores/osTypeStore"
import { getOSIcon } from "@/utils/osIcons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SearchEmptyState } from "@/components/connection/SearchEmptyState"
import { useState, useMemo } from "react"

interface PanelSelectorProps {
  onSelect: (type: 'local' | 'remote', connectionId?: string) => void
  onCancel: () => void
}

export function PanelSelector({ onSelect, onCancel }: PanelSelectorProps) {
  const connections = useConnectionStore((state) => state.connections)
  const getOSType = useOSTypeStore((state) => state.getOSType)
  const [query, setQuery] = useState('')

  const filteredConnections = useMemo(() => {
    if (!query.trim()) return connections

    const lowerQuery = query.toLowerCase()
    return connections.filter(conn => 
      conn.name.toLowerCase().includes(lowerQuery) ||
      conn.host.toLowerCase().includes(lowerQuery) ||
      conn.port.toString().includes(lowerQuery)
    )
  }, [connections, query])

  const showSearchEmpty = query.trim() && filteredConnections.length === 0

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="text-lg font-semibold">Select Source</h3>
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search connections..."
            className="pl-9"
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-auto p-4 space-y-2">
        {!query.trim() && (
          <button
            onClick={() => onSelect('local')}
            className="w-full p-2 rounded-lg bg-card hover:bg-accent/50 transition-colors cursor-pointer flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-lg bg-accent flex items-center justify-center shrink-0">
              <Home className="w-6 h-6" />
            </div>
            <div className="flex flex-col items-start">
              <span className="font-medium">Local</span>
              <span className="text-sm text-muted-foreground">Browse local files</span>
            </div>
          </button>
        )}

        {showSearchEmpty ? (
          <SearchEmptyState />
        ) : (
          filteredConnections.map((connection) => {
            const osType = getOSType(connection.id)
            const OSIcon = getOSIcon(osType)
            
            return (
              <button
                key={connection.id}
                onClick={() => onSelect('remote', connection.id)}
                className="w-full p-2 rounded-lg bg-card hover:bg-accent/50 transition-colors cursor-pointer flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-lg bg-accent flex items-center justify-center shrink-0">
                  <OSIcon className="w-6 h-6" />
                </div>
                <div className="flex flex-col items-start">
                  <span className="font-medium">{connection.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {connection.host}:{connection.port}
                  </span>
                </div>
              </button>
            )
          })
        )}

        {!showSearchEmpty && connections.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">
            No connections available
          </p>
        )}
      </div>
    </div>
  )
}
