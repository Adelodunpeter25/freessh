import { createContext, useContext, useState, useMemo, useCallback, ReactNode } from 'react'
import { usePortForwardConfig } from '@/hooks'
import { portForwardService } from '@/services/ipc/portforward'
import { useConnections } from '@/hooks'
import { PortForwardConfig, TunnelInfo, ConnectionConfig } from '@/types'
import { toast } from 'sonner'

interface PortForwardContextValue {
  configs: PortForwardConfig[]
  loading: boolean
  activeTunnels: Set<string>
  connections: Map<string, string>
  connectionList: ConnectionConfig[]
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
  
  // Map connection IDs to names
  const connectionNames = useMemo(() => {
    const map = new Map<string, string>()
    connections.forEach(conn => map.set(conn.id, conn.name))
    return map
  }, [connections])

  // Load active tunnels is removed - tunnels are managed per config now

  const activeTunnels = useMemo(() => {
    return new Set(activeTunnelMap.keys())
  }, [activeTunnelMap])

  const startTunnel = useCallback(async (configId: string) => {
    const config = configs.find(c => c.id === configId)
    if (!config) return

    toast.info('Starting tunnel...')

    try {
      let tunnel: TunnelInfo
      
      if (config.type === 'local') {
        tunnel = await portForwardService.createLocal(config.connection_id, config.name, {
          local_port: config.local_port,
          remote_host: config.remote_host,
          remote_port: config.remote_port,
          binding_address: config.binding_address
        })
      } else {
        tunnel = await portForwardService.createRemote(config.connection_id, config.name, {
          remote_port: config.remote_port,
          local_host: config.remote_host,
          local_port: config.local_port,
          binding_address: config.binding_address
        })
      }
      
      setActiveTunnelMap(prev => new Map(prev).set(configId, tunnel))
      toast.success('Tunnel started')
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to start tunnel'
      toast.error(errorMsg)
    }
  }, [configs])

  const stopTunnel = useCallback(async (configId: string) => {
    const tunnel = activeTunnelMap.get(configId)
    if (!tunnel) return

    const config = configs.find(c => c.id === configId)
    if (!config) return

    toast.info('Stopping tunnel...')

    try {
      await portForwardService.stop(config.connection_id, tunnel.id)
      setActiveTunnelMap(prev => {
        const next = new Map(prev)
        next.delete(configId)
        return next
      })
      toast.success('Tunnel stopped')
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to stop tunnel'
      toast.error(errorMsg)
    }
  }, [activeTunnelMap, configs])

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
    connectionList: connections,
    startTunnel,
    stopTunnel,
    createConfig,
    updateConfig,
    deleteConfig,
    getConnectionName
  }), [configs, loading, activeTunnels, connectionNames, connections, startTunnel, stopTunnel, createConfig, updateConfig, deleteConfig, getConnectionName])

  return (
    <PortForwardContext.Provider value={value}>
      {children}
    </PortForwardContext.Provider>
  )
}
