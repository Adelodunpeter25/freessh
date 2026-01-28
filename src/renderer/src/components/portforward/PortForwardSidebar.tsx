import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { PortForwardConfig, ConnectionConfig } from '@/types'

interface PortForwardSidebarProps {
  isOpen: boolean
  onClose: () => void
  onSave: (config: Omit<PortForwardConfig, 'id'>) => Promise<void>
  connections: ConnectionConfig[]
  editConfig?: PortForwardConfig
}

export function PortForwardSidebar({ isOpen, onClose, onSave, connections, editConfig }: PortForwardSidebarProps) {
  const [activeTab, setActiveTab] = useState<'local' | 'remote'>('local')
  const [name, setName] = useState('')
  const [connectionId, setConnectionId] = useState('')
  const [localPort, setLocalPort] = useState('')
  const [remoteHost, setRemoteHost] = useState('')
  const [remotePort, setRemotePort] = useState('')
  const [bindingAddress, setBindingAddress] = useState('localhost')
  const [autoStart, setAutoStart] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (editConfig) {
      setName(editConfig.name)
      setConnectionId(editConfig.connection_id)
      setActiveTab(editConfig.type)
      setLocalPort(editConfig.local_port.toString())
      setRemoteHost(editConfig.remote_host)
      setRemotePort(editConfig.remote_port.toString())
      setBindingAddress(editConfig.binding_address)
      setAutoStart(editConfig.auto_start)
    } else {
      setName('')
      setConnectionId('')
      setLocalPort('')
      setRemoteHost('')
      setRemotePort('')
      setBindingAddress('localhost')
      setAutoStart(false)
      setActiveTab('local')
    }
  }, [editConfig, isOpen])

  if (!isOpen) return null

  const handleSave = async () => {
    setSaving(true)
    try {
      await onSave({
        name,
        connection_id: connectionId,
        type: activeTab,
        local_port: parseInt(localPort),
        remote_host: remoteHost,
        remote_port: parseInt(remotePort),
        binding_address: bindingAddress,
        auto_start: autoStart
      })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed right-0 top-12 bottom-0 w-80 bg-background border-l shadow-lg z-50 flex flex-col animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold">{editConfig ? 'Edit' : 'New'} Port Forward</h2>
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
        <div>
          <Label className="text-xs text-muted-foreground mb-1.5">Name</Label>
          <Input
            placeholder="e.g. Production Database"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          <Label className="text-xs text-muted-foreground mb-1.5">Connection</Label>
          <Select value={connectionId} onValueChange={setConnectionId}>
            <SelectTrigger>
              <SelectValue placeholder="Select connection" />
            </SelectTrigger>
            <SelectContent>
              {connections.map((conn) => (
                <SelectItem key={conn.id} value={conn.id}>
                  {conn.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {activeTab === 'local' ? (
          <>
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5">Binding Address</Label>
              <Select value={bindingAddress} onValueChange={setBindingAddress}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="localhost">localhost</SelectItem>
                  <SelectItem value="0.0.0.0">0.0.0.0 (all interfaces)</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
              value={remoteHost}
              onChange={(e) => setRemoteHost(e.target.value)}
            />
            <Input
              type="number"
              placeholder="Local Port"
              value={localPort}
              onChange={(e) => setLocalPort(e.target.value)}
            />
          </>
        )}

        <div className="flex items-center space-x-2">
          <Checkbox
            id="auto-start"
            checked={autoStart}
            onCheckedChange={(checked) => setAutoStart(checked as boolean)}
          />
          <label
            htmlFor="auto-start"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Auto-start with connection
          </label>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t space-y-2 bg-background">
        <Button
          onClick={handleSave}
          disabled={saving || !name || !connectionId}
          className="w-full"
        >
          {saving ? 'Saving...' : editConfig ? 'Save Changes' : 'Create'}
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

}
