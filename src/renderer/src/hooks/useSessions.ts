import { useState, useEffect, useCallback } from 'react'
import { sessionService } from '../services/ipc'
import { Session } from '../types'

export const useSessions = () => {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadSessions = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const data = await sessionService.listSessions()
      setSessions(data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load sessions'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  const connectLocal = useCallback(async () => {
    setError(null)
    try {
      const session = await sessionService.connectLocal()
      return session
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create local terminal'
      setError(errorMessage)
      throw err
    }
  }, [])

  useEffect(() => {
    loadSessions()
  }, [loadSessions])

  return {
    sessions,
    loading,
    error,
    reload: loadSessions,
    connectLocal
  }
}
