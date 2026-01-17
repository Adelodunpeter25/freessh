import { useState, useCallback, useEffect } from 'react'
import { portForwardService } from '@/services/ipc/portforward'
import { TunnelConfig, TunnelInfo } from '@/types'

export const usePortForward = (sessionId: string | null) => {
  const [tunnels, setTunnels] = useState<TunnelInfo[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadTunnels = useCallback(async () => {
    if (!sessionId) return

    setLoading(true)
    try {
      const data = await portForwardService.list(sessionId)
      setTunnels(data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load tunnels'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [sessionId])

  useEffect(() => {
    if (sessionId) {
      loadTunnels()
    } else {
      setTunnels([])
    }
  }, [sessionId, loadTunnels])

  const createTunnel = useCallback(async (config: TunnelConfig) => {
    if (!sessionId) return

    setError(null)
    try {
      const tunnel = await portForwardService.create(sessionId, config)
      setTunnels(prev => [...prev, tunnel])
      return tunnel
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create tunnel'
      setError(errorMessage)
      throw err
    }
  }, [sessionId])

  const stopTunnel = useCallback(async (tunnelId: string) => {
    if (!sessionId) return

    setError(null)
    try {
      await portForwardService.stop(sessionId, tunnelId)
      setTunnels(prev => prev.filter(t => t.id !== tunnelId))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to stop tunnel'
      setError(errorMessage)
      throw err
    }
  }, [sessionId])

  return {
    tunnels,
    loading,
    error,
    createTunnel,
    stopTunnel,
    refresh: loadTunnels
  }
}
