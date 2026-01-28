import { useState, useEffect, useCallback } from 'react'
import { knownHostsService } from '@/services/knownHosts'
import { KnownHost } from '@/types/knownHost'
import { toast } from 'sonner'

export function useKnownHosts() {
  const [hosts, setHosts] = useState<KnownHost[]>([])
  const [loading, setLoading] = useState(true)

  const loadHosts = useCallback(async () => {
    setLoading(true)
    try {
      const data = await knownHostsService.getAll()
      setHosts(data)
    } catch (error) {
      console.error('Failed to load known hosts:', error)
      toast.error('Failed to load known hosts')
    } finally {
      setLoading(false)
    }
  }, [])

  const removeHost = useCallback(async (id: string) => {
    try {
      await knownHostsService.remove(id)
      setHosts(prev => prev.filter(h => h.id !== id))
      toast.success('Host removed')
    } catch (error) {
      console.error('Failed to remove host:', error)
      toast.error('Failed to remove host')
    }
  }, [])

  useEffect(() => {
    loadHosts()
  }, [loadHosts])

  return {
    hosts,
    loading,
    removeHost,
    reload: loadHosts
  }
}
