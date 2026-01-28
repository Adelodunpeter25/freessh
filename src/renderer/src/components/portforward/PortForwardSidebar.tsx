import { useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface PortForwardSidebarProps {
  isOpen: boolean
  onClose: () => void
  onCreateLocal: (config: { localPort: number; remoteHost: string; remotePort: number }) => Promise<void>
  onCreateRemote: (config: { remotePort: number; localHost: string; localPort: number }) => Promise<void>
}

export function PortForwardSidebar({ isOpen, onClose, onCreateLocal, onCreateRemote }: PortForwardSidebarProps) {
  const [activeTab, setActiveTab] = useState<'local' | 'remote'>('local')
  const [localPort, setLocalPort] = useState('')
  const [remoteHost, setRemoteHost] = useState('')
  const [remotePort, setRemotePort] = useState('')
  const [localHost, setLocalHost] = useState('')
  const [creating, setCreating] = useState(false)

  if (!isOpen) return null

  const handleCreate = async () => {
    setCreating(true)
    try {
      if (activeTab === 'local') {
        await onCreateLocal({
          localPort: parseInt(localPort),
          remoteHost,
          remotePort: parseInt(remotePort)
        })
        setLocalPort('')
        setRemoteHost('')
        setRemotePort('')
      } else {
        await onCreateRemote({
          remotePort: parseInt(remotePort),
          localHost,
          localPort: parseInt(localPort)
        })
        setRemotePort('')
        setLocalHost('')
        setLocalPort('')
      }
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-background border-l shadow-lg z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold">Port Forwarding</h2>
        <button
          onClick={onClose}
          className="p-1 hover:bg-muted rounded-md transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b">
        <button
          onClick={() => setActiveTab('local')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'local'
              ? 'text-primary border-b-2 border-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Local
        </button>
        <button
          onClick={() => setActiveTab('remote')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'remote'
              ? 'text-primary border-b-2 border-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Remote
        </button>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeTab === 'local' ? (
          <>
            <Input
              type="number"
              placeholder="Local Port"
              value={localPort}
              onChange={(e) => setLocalPort(e.target.value)}
            />
            <Input
              placeholder="Remote Host"
              value={remoteHost}
              onChange={(e) => setRemoteHost(e.target.value)}
            />
            <Input
              type="number"
              placeholder="Remote Port"
              value={remotePort}
              onChange={(e) => setRemotePort(e.target.value)}
            />
          </>
        ) : (
          <>
            <Input
              type="number"
              placeholder="Remote Port"
              value={remotePort}
              onChange={(e) => setRemotePort(e.target.value)}
            />
            <Input
              placeholder="Local Host"
              value={localHost}
              onChange={(e) => setLocalHost(e.target.value)}
            />
            <Input
              type="number"
              placeholder="Local Port"
              value={localPort}
              onChange={(e) => setLocalPort(e.target.value)}
            />
          </>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t space-y-2">
        <Button
          onClick={handleCreate}
          disabled={creating}
          className="w-full"
        >
          {creating ? 'Creating...' : 'Create Tunnel'}
        </Button>
        <Button
          onClick={onClose}
          variant="outline"
          className="w-full"
        >
          Cancel
        </Button>
      </div>
    </div>
  )
}
