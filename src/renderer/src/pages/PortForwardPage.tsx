import { useState, useMemo, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TunnelList, PortForwardSidebar } from '@/components/portforward'
import { usePortForwardConfig } from '@/hooks/usePortForwardConfig'
import { portForwardService } from '@/services/ipc/portforward'
import { useConnections } from '@/hooks/useConnections'
import { useTabStore } from '@/stores/tabStore'
import { PortForwardConfig, TunnelInfo } from '@/types'
import { toast } from 'sonner'

export function PortForwardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [editConfig, setEditConfig] = useState<PortForwardConfig | undefined>()
  const [activeTunnels, setActiveTunnels] = useState<Map<string, TunnelInfo>>(new Map())
  
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

  // Map connection IDs to names
  const connectionNames = useMemo(() => {
    const map = new Map<string, string>()
    connections.forEach(conn => map.set(conn.id, conn.name))
    return map
  }, [connections])

  // Load active tunnels for all sessions
  useEffect(() => {
    const loadActiveTunnels = async () => {
      const tunnelMap = new Map<string, TunnelInfo>()
      
      for (const [connectionId, sessionId] of sessionMap.entries()) {
        try {
          const tunnels = await portForwardService.list(sessionId)
          tunnels.forEach(tunnel => {
            // Find matching config by ports and type
            const config = configs.find(c => 
              c.connection_id === connectionId &&
              c.type === tunnel.type &&
              c.local_port === tunnel.local_port &&
              c.remote_port === tunnel.remote_port
            )
            if (config) {
              tunnelMap.set(config.id, tunnel)
            }
          })
        } catch (error) {
          console.error('Failed to load tunnels for session:', sessionId, error)
        }
      }
      
      setActiveTunnels(tunnelMap)
    }

    if (configs.length > 0 && sessionMap.size > 0) {
      loadActiveTunnels()
    }
  }, [configs, sessionMap])

  const activeTunnelIds = useMemo(() => {
    return new Set(activeTunnels.keys())
  }, [activeTunnels])

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
      // Stop tunnel if active
      if (activeTunnels.has(id)) {
        await handleStop(id)
      }
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

    try {
      let tunnel: TunnelInfo
      
      if (config.type === 'local') {
        tunnel = await portForwardService.createLocal(sessionId, {
          local_port: config.local_port,
          remote_host: config.remote_host,
          remote_port: config.remote_port
        })
      } else {
        tunnel = await portForwardService.createRemote(sessionId, {
          remote_port: config.remote_port,
          local_host: config.remote_host,
          local_port: config.local_port
        })
      }
      
      setActiveTunnels(prev => new Map(prev).set(id, tunnel))
      toast.success('Tunnel started')
    } catch (error) {
      toast.error('Failed to start tunnel')
      console.error(error)
    }
  }

  const handleStop = async (id: string) => {
    const tunnel = activeTunnels.get(id)
    if (!tunnel) return

    const config = configs.find(c => c.id === id)
    if (!config) return

    const sessionId = sessionMap.get(config.connection_id)
    if (!sessionId) return

    try {
      await portForwardService.stop(sessionId, tunnel.id)
      setActiveTunnels(prev => {
        const next = new Map(prev)
        next.delete(id)
        return next
      })
      toast.success('Tunnel stopped')
    } catch (error) {
      toast.error('Failed to stop tunnel')
      console.error(error)
    }
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
          activeTunnels={activeTunnelIds}
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
