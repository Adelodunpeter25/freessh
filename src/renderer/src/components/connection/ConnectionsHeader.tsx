import { Server, Search, Cable } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ConnectionConfig } from '@/types'

interface ConnectionsHeaderProps {
  onNewConnection: () => void
  searchQuery: string
  onSearchChange: (query: string) => void
  filteredConnections: ConnectionConfig[]
  onConnect: (connection: ConnectionConfig) => void
  onOpenSFTP: (connection: ConnectionConfig) => void
}

export function ConnectionsHeader({ 
  onNewConnection, 
  searchQuery, 
  onSearchChange,
  filteredConnections,
  onConnect,
  onOpenSFTP
}: ConnectionsHeaderProps) {
  const singleResult = filteredConnections.length === 1 ? filteredConnections[0] : null

  return (
    <div className="flex flex-col gap-3 px-4 py-3 border-b bg-background/95">
      {/* Search Bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Find a host or ssh user@hostname..."
            className="pl-10 bg-muted/50"
          />
        </div>
        {singleResult && (
          <>
            <Button 
              size="sm" 
              onClick={() => onConnect(singleResult)}
              className="shrink-0"
            >
              Connect
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => onOpenSFTP(singleResult)}
              className="shrink-0"
            >
              <Cable className="h-4 w-4 mr-2" />
              Open SFTP
            </Button>
          </>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <Button 
          onClick={onNewConnection}
          variant="secondary" 
          size="sm"
          className="font-medium"
        >
          <Server className="h-4 w-4 mr-2" />
          NEW HOST
        </Button>
      </div>
    </div>
  )
}
