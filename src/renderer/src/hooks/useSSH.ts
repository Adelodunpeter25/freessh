import { useState, useCallback } from 'react'
import { sshService } from '../services/ipc'
import { ConnectionConfig, Session } from '../types'

export const useSSH = () => {
  const [connecting, setConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [session, setSession] = useState<Session | null>(null)

  const connect = useCallback(async (config: ConnectionConfig) => {
    setConnecting(true)
    setError(null)
    
    try {
      const newSession = await sshService.connect(config)
      setSession(newSession)
      return newSession
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Connection failed'
      setError(errorMessage)
      throw err
    } finally {
      setConnecting(false)
    }
  }, [])

  const disconnect = useCallback(async (sessionId: string) => {
    try {
      await sshService.disconnect(sessionId)
      setSession(null)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Disconnect failed'
      setError(errorMessage)
      throw err
    }
  }, [])

  return {
    session,
    connecting,
    error,
    connect,
    disconnect
  }
}
