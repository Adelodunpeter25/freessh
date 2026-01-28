import { useState, useMemo } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TunnelList, PortForwardSidebar } from '@/components/portforward'
import { usePortForwardConfig } from '@/hooks/usePortForwardConfig'
import { usePortForward } from '@/hooks/usePortForward'
import { useConnections } from '@/hooks/useConnections'
import { useTabStore } from '@/stores/tabStore'
import { PortForwardConfig } from '@/types'
import { toast } from 'sonner'

export function PortForwardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [editConfig, setEditConfig] = useState<PortForwardConfig | undefined>()
  
  const { configs, loading, createConfig, updateConfig, deleteConfig } = usePortForwardConfig()
  const { connections } = useConnections()
  const tabs = useTabStore((state) => state.tabs)
  
  // Get active session for each connection
  const sessionMap = useMemo(() => {
    const map = new Map<string, string>()
    tabs.forEach(tab => {
      if (tab.type === 'terminal' && tab.connectionId && tab.sessionId) {
        map.set(tab.connectionId, tab.sessionId)
      }
    })
    return map
  }, [tabs])

  // Track active tunnels (simplified - would need to query backend)
  const activeTunnels = useMemo(() => new Set<string>(), [])

  // Map connection IDs to names
  const connectionNames = useMemo(() => {
    const map = new Map<string, string>()
    connections.forEach(conn => map.set(conn.id, conn.name))
    return map
  }, [connections])

  const handleSave = async (config: Omit<PortForwardConfig, 'id'>) => {
    if (editConfig) {
      await updateConfig({ ...config, id: editConfig.id })
    } else {
      await createConfig(config)
    }
    setSidebarOpen(false)
    setEditConfig(undefined)
  }

  const handleEdit = (config: PortForwardConfig) => {
    setEditConfig(config)
    setSidebarOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Delete this port forward configuration?')) {
      await deleteConfig(id)
    }
  }

  const handleStart = async (id: string) => {
    const config = configs.find(c => c.id === id)
    if (!config) return

    const sessionId = sessionMap.get(config.connection_id)
    if (!sessionId) {
      toast.error('Connection is not active. Please connect first.')
      return
    }

    // TODO: Start tunnel using portForwardService
    toast.info('Starting tunnel...')
  }

  const handleStop = async (id: string) => {
    // TODO: Stop tunnel using portForwardService
    toast.info('Stopping tunnel...')
  }

  const handleNew = () => {
    setEditConfig(undefined)
    setSidebarOpen(true)
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Port Forwarding</h2>
          <p className="text-sm text-muted-foreground">
            Manage SSH port forwarding configurations
          </p>
        </div>
        <Button onClick={handleNew} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          New Port Forward
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <TunnelList
          configs={configs}
          loading={loading}
          activeTunnels={activeTunnels}
          connections={connectionNames}
          onStart={handleStart}
          onStop={handleStop}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      <PortForwardSidebar
        isOpen={sidebarOpen}
        onClose={() => {
          setSidebarOpen(false)
          setEditConfig(undefined)
        }}
        onSave={handleSave}
        connections={connections}
        editConfig={editConfig}
      />
    </div>
  )
}
