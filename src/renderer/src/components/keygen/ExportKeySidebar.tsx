import { useState } from 'react'
import { Server } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet } from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useConnections } from '@/hooks'

interface ExportKeySidebarProps {
  keyId: string
  keyName: string
  isOpen: boolean
  onClose: () => void
  onExport: (keyId: string, connectionId: string) => Promise<void>
}

export function ExportKeySidebar({ keyId, keyName, isOpen, onClose, onExport }: ExportKeySidebarProps) {
  const { connections, loading } = useConnections()
  const [selectedConnectionId, setSelectedConnectionId] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)

  const handleExport = async () => {
    if (!selectedConnectionId) return

    setExporting(true)
    try {
      await onExport(keyId, selectedConnectionId)
      onClose()
    } finally {
      setExporting(false)
    }
  }

  return (
    <Sheet isOpen={isOpen} onClose={onClose} title="Export SSH Key" width="sm">
      <div className="px-4 pt-2 pb-4 border-b">
        <p className="text-sm font-medium text-muted-foreground">{keyName}</p>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="p-4 border-b">
          <p className="text-sm text-muted-foreground">
            Select a connection to export this key to. The public key will be added to the host's authorized_keys file.
          </p>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-4 space-y-2">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <p className="text-muted-foreground">Loading connections...</p>
              </div>
            ) : connections.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-center">
                <p className="text-muted-foreground">No connections available</p>
              </div>
            ) : (
              connections.map((connection) => (
                <div
                  key={connection.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedConnectionId === connection.id
                      ? 'bg-primary/10 border-primary'
                      : 'border-border hover:bg-muted/50'
                  }`}
                  onClick={() => setSelectedConnectionId(connection.id)}
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                    <Server className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-foreground truncate">
                      {connection.name}
                    </h3>
                    <p className="text-xs text-muted-foreground truncate">
                      {connection.username}@{connection.host}:{connection.port}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      <div className="p-4 border-t border-border bg-background">
        <div className="flex gap-2">
          <Button
            className="flex-1"
            onClick={handleExport}
            disabled={!selectedConnectionId || exporting}
          >
            {exporting ? 'Exporting...' : 'Export Key'}
          </Button>
          <Button variant="outline" onClick={onClose} disabled={exporting}>
            Cancel
          </Button>
        </div>
      </div>
    </Sheet>
  )
}
