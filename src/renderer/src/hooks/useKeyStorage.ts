import { useState, useCallback, useEffect } from 'react'
import { keyStorageService } from '@/services/keyStorage'
import { SSHKey } from '@/types/key'
import { toast } from 'sonner'

export const useKeyStorage = () => {
  const [keys, setKeys] = useState<SSHKey[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadKeys = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await keyStorageService.list()
      setKeys(data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load keys'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  const saveKey = useCallback(async (key: Omit<SSHKey, 'id' | 'createdAt'>) => {
    try {
      const saved = await keyStorageService.save(key)
      setKeys((prev) => [saved, ...prev])
      toast.success('SSH key saved')
      return saved
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save key'
      toast.error(errorMessage)
      throw err
    }
  }, [])

  const deleteKey = useCallback(async (id: string) => {
    try {
      await keyStorageService.delete(id)
      setKeys((prev) => prev.filter((k) => k.id !== id))
      toast.success('SSH key deleted')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete key'
      toast.error(errorMessage)
      throw err
    }
  }, [])

  useEffect(() => {
    loadKeys()
  }, [loadKeys])

  return {
    keys,
    loading,
    error,
    loadKeys,
    saveKey,
    deleteKey
  }
}
