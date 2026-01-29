import { useState, useEffect } from 'react'
import { PortForwardConfig, ConnectionConfig } from '@/types'
import { Sheet } from '@/components/ui/sheet'
import { PortForwardForm } from './PortForwardForm'
import { PortForwardFooter } from './PortForwardFooter'

interface PortForwardSidebarProps {
  isOpen: boolean
  onClose: () => void
  onSave: (config: Omit<PortForwardConfig, 'id'>) => Promise<void>
  connections: ConnectionConfig[]
  editConfig?: PortForwardConfig
}

export function PortForwardSidebar({ isOpen, onClose, onSave, connections, editConfig }: PortForwardSidebarProps) {
  const [activeTab, setActiveTab] = useState<'local' | 'remote' | 'dynamic'>('local')
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
    <Sheet 
      isOpen={isOpen} 
      onClose={onClose} 
      title={editConfig ? 'Edit Port Forward' : 'New Port Forward'}
    >
      <div className="flex border-b">
        <button
          onClick={() => setActiveTab('local')}
          className={`flex-1 px-4 py-2.5 text-xs font-medium transition-colors ${
            activeTab === 'local'
              ? 'text-primary border-b-2 border-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Local
        </button>
        <button
          onClick={() => setActiveTab('remote')}
          className={`flex-1 px-4 py-2.5 text-xs font-medium transition-colors ${
            activeTab === 'remote'
              ? 'text-primary border-b-2 border-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Remote
        </button>
        <button
          onClick={() => setActiveTab('dynamic')}
          className={`flex-1 px-4 py-2.5 text-xs font-medium transition-colors ${
            activeTab === 'dynamic'
              ? 'text-primary border-b-2 border-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Dynamic
        </button>
      </div>
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'dynamic'
              ? 'text-primary border-b-2 border-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Dynamic
        </button>
      </div>

      <PortForwardForm
        activeTab={activeTab}
        name={name}
        connectionId={connectionId}
        localPort={localPort}
        remoteHost={remoteHost}
        remotePort={remotePort}
        bindingAddress={bindingAddress}
        autoStart={autoStart}
        connections={connections}
        onNameChange={setName}
        onConnectionChange={setConnectionId}
        onLocalPortChange={setLocalPort}
        onRemoteHostChange={setRemoteHost}
        onRemotePortChange={setRemotePort}
        onBindingAddressChange={setBindingAddress}
        onAutoStartChange={setAutoStart}
      />

      <PortForwardFooter
        saving={saving}
        isEdit={!!editConfig}
        canSave={!!name && !!connectionId}
        onSave={handleSave}
        onClose={onClose}
      />
    </Sheet>
  )
}
