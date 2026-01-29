import { useState, useCallback, useEffect } from 'react'
import { portForwardConfigService } from '@/services/ipc/portForwardConfig'
import { PortForwardConfig } from '@/types'
import { toast } from 'sonner'

export const usePortForwardConfig = () => {
  const [configs, setConfigs] = useState<PortForwardConfig[]>([])
  const [loading, setLoading] = useState(false)

  const loadConfigs = useCallback(async () => {
    setLoading(true)
    try {
      const data = await portForwardConfigService.getAll()
      setConfigs(data)
    } catch (error) {
      console.error('Failed to load port forward configs:', error)
      toast.error('Failed to load port forward configs')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadConfigs()
  }, [])

  const createConfig = useCallback(async (config: Omit<PortForwardConfig, 'id'>) => {
    try {
      const created = await portForwardConfigService.create(config)
      setConfigs(prev => [...prev, created])
      toast.success('Port forward config created')
      return created
    } catch (error) {
      console.error('Failed to create config:', error)
      toast.error('Failed to create config')
      throw error
    }
  }, [])

  const updateConfig = useCallback(async (config: PortForwardConfig) => {
    try {
      const updated = await portForwardConfigService.update(config)
      setConfigs(prev => prev.map(c => c.id === updated.id ? updated : c))
      toast.success('Port forward config updated')
      return updated
    } catch (error) {
      console.error('Failed to update config:', error)
      toast.error('Failed to update config')
      throw error
    }
  }, [])

  const deleteConfig = useCallback(async (id: string) => {
    try {
      await portForwardConfigService.delete(id)
      setConfigs(prev => prev.filter(c => c.id !== id))
      toast.success('Port forward config deleted')
    } catch (error) {
      console.error('Failed to delete config:', error)
      toast.error('Failed to delete config')
      throw error
    }
  }, [])

  return {
    configs,
    loading,
    createConfig,
    updateConfig,
    deleteConfig,
    reload: loadConfigs
  }
}
