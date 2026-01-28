import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ConnectionConfig } from '@/types'

interface PortForwardFormProps {
  activeTab: 'local' | 'remote'
  name: string
  connectionId: string
  localPort: string
  remoteHost: string
  remotePort: string
  bindingAddress: string
  autoStart: boolean
  connections: ConnectionConfig[]
  onNameChange: (value: string) => void
  onConnectionChange: (value: string) => void
  onLocalPortChange: (value: string) => void
  onRemoteHostChange: (value: string) => void
  onRemotePortChange: (value: string) => void
  onBindingAddressChange: (value: string) => void
  onAutoStartChange: (value: boolean) => void
}

export function PortForwardForm({
  activeTab,
  name,
  connectionId,
  localPort,
  remoteHost,
  remotePort,
  bindingAddress,
  autoStart,
  connections,
  onNameChange,
  onConnectionChange,
  onLocalPortChange,
  onRemoteHostChange,
  onRemotePortChange,
  onBindingAddressChange,
  onAutoStartChange
}: PortForwardFormProps) {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      <div>
        <Label className="text-xs text-muted-foreground mb-1.5">Name</Label>
        <Input
          placeholder="e.g. Production Database"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
        />
      </div>

      <div>
        <Label className="text-xs text-muted-foreground mb-1.5">Connection</Label>
        <Select value={connectionId} onValueChange={onConnectionChange}>
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
            <Select value={bindingAddress} onValueChange={onBindingAddressChange}>
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
            onChange={(e) => onLocalPortChange(e.target.value)}
          />
          <Input
            placeholder="Remote Host"
            value={remoteHost}
            onChange={(e) => onRemoteHostChange(e.target.value)}
          />
          <Input
            type="number"
            placeholder="Remote Port"
            value={remotePort}
            onChange={(e) => onRemotePortChange(e.target.value)}
          />
        </>
      ) : (
        <>
          <Input
            type="number"
            placeholder="Remote Port"
            value={remotePort}
            onChange={(e) => onRemotePortChange(e.target.value)}
          />
          <Input
            placeholder="Local Host"
            value={remoteHost}
            onChange={(e) => onRemoteHostChange(e.target.value)}
          />
          <Input
            type="number"
            placeholder="Local Port"
            value={localPort}
            onChange={(e) => onLocalPortChange(e.target.value)}
          />
        </>
      )}

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="auto-start"
          checked={autoStart}
          onChange={(e) => onAutoStartChange(e.target.checked)}
          className="w-4 h-4 rounded border-gray-300"
        />
        <label
          htmlFor="auto-start"
          className="text-sm font-medium leading-none cursor-pointer"
        >
          Auto-start with connection
        </label>
      </div>
    </div>
  )
}
