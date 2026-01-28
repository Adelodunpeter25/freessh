import { createContext, useContext, useState, useMemo, useEffect, useCallback, ReactNode } from 'react'
import { usePortForwardConfig } from '@/hooks/usePortForwardConfig'
import { portForwardService } from '@/services/ipc/portforward'
import { useConnections } from '@/hooks/useConnections'
import { useTabStore } from '@/stores/tabStore'
import { PortForwardConfig, TunnelInfo } from '@/types'
import { toast } from 'sonner'

interface PortForwardContextValue {
  configs: PortForwardConfig[]
  loading: boolean
  activeTunnels: Set<string>
  connections: Map<string, string>
  startTunnel: (configId: string) => Promise<void>
  stopTunnel: (configId: string) => Promise<void>
  createConfig: (config: Omit<PortForwardConfig, 'id'>) => Promise<void>
  updateConfig: (config: PortForwardConfig) => Promise<void>
  deleteConfig: (configId: string) => Promise<void>
  getConnectionName: (connectionId: string) => string | undefined
}

const PortForwardContext = createContext<PortForwardContextValue | null>(null)

export function usePortForwardContext() {
  const context = useContext(PortForwardContext)
  if (!context) {
    throw new Error('usePortForwardContext must be used within PortForwardProvider')
  }
  return context
}

interface PortForwardProviderProps {
  children: ReactNode
}

export function PortForwardProvider({ children }: PortForwardProviderProps) {
  const [activeTunnelMap, setActiveTunnelMap] = useState<Map<string, TunnelInfo>>(new Map())
  
  const { configs, loading, createConfig: createConfigHook, updateConfig: updateConfigHook, deleteConfig: deleteConfigHook } = usePortForwardConfig()
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
      
      setActiveTunnelMap(tunnelMap)
    }

    if (configs.length > 0 && sessionMap.size > 0) {
      loadActiveTunnels()
    }
  }, [configs, sessionMap])

  const activeTunnels = useMemo(() => {
    return new Set(activeTunnelMap.keys())
  }, [activeTunnelMap])

  const startTunnel = useCallback(async (configId: string) => {
    const config = configs.find(c => c.id === configId)
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
      
      setActiveTunnelMap(prev => new Map(prev).set(configId, tunnel))
      toast.success('Tunnel started')
    } catch (error) {
      toast.error('Failed to start tunnel')
      console.error(error)
    }
  }, [configs, sessionMap])

  const stopTunnel = useCallback(async (configId: string) => {
    const tunnel = activeTunnelMap.get(configId)
    if (!tunnel) return

    const config = configs.find(c => c.id === configId)
    if (!config) return

    const sessionId = sessionMap.get(config.connection_id)
    if (!sessionId) return

    try {
      await portForwardService.stop(sessionId, tunnel.id)
      setActiveTunnelMap(prev => {
        const next = new Map(prev)
        next.delete(configId)
        return next
      })
      toast.success('Tunnel stopped')
    } catch (error) {
      toast.error('Failed to stop tunnel')
      console.error(error)
    }
  }, [activeTunnelMap, configs, sessionMap])

  const createConfig = useCallback(async (config: Omit<PortForwardConfig, 'id'>) => {
    await createConfigHook(config)
  }, [createConfigHook])

  const updateConfig = useCallback(async (config: PortForwardConfig) => {
    await updateConfigHook(config)
  }, [updateConfigHook])

  const deleteConfig = useCallback(async (configId: string) => {
    if (activeTunnelMap.has(configId)) {
      await stopTunnel(configId)
    }
    await deleteConfigHook(configId)
  }, [activeTunnelMap, stopTunnel, deleteConfigHook])

  const getConnectionName = useCallback((connectionId: string) => {
    return connectionNames.get(connectionId)
  }, [connectionNames])

  const value: PortForwardContextValue = useMemo(() => ({
    configs,
    loading,
    activeTunnels,
    connections: connectionNames,
    startTunnel,
    stopTunnel,
    createConfig,
    updateConfig,
    deleteConfig,
    getConnectionName
  }), [configs, loading, activeTunnels, connectionNames, startTunnel, stopTunnel, createConfig, updateConfig, deleteConfig, getConnectionName])

  return (
    <PortForwardContext.Provider value={value}>
      {children}
    </PortForwardContext.Provider>
  )
}
