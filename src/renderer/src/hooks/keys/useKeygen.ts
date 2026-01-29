import { useState, useCallback } from 'react'
import { keygenService } from '@/services/ipc/keygen'
import { KeyGenerationOptions, GeneratedKeyPair } from '@/types/keygen'
import { toast } from 'sonner'

export const useKeygen = () => {
  const [loading, setLoading] = useState(false)
  const [generatedKey, setGeneratedKey] = useState<GeneratedKeyPair | null>(null)
  const [error, setError] = useState<string | null>(null)

  const generateKey = useCallback(async (options: KeyGenerationOptions) => {
    setLoading(true)
    setError(null)
    try {
      const keyPair = await keygenService.generateKey(options)
      setGeneratedKey(keyPair)
      toast.success('SSH key generated successfully')
      return keyPair
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate key'
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const getFingerprint = useCallback(async (publicKey: string) => {
    try {
      return await keygenService.getFingerprint(publicKey)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get fingerprint'
      toast.error(errorMessage)
      throw err
    }
  }, [])

  const clearGeneratedKey = useCallback(() => {
    setGeneratedKey(null)
    setError(null)
  }, [])

  return {
    loading,
    generatedKey,
    error,
    generateKey,
    getFingerprint,
    clearGeneratedKey
  }
}
