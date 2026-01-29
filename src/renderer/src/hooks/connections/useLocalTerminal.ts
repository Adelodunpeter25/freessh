import { useState, useCallback, useMemo } from 'react'
import { toast } from 'sonner'
import { useSessions } from '@/hooks/useSessions'
import { useTabStore } from '@/stores/tabStore'
import { useSessionStore } from '@/stores/sessionStore'

export function useLocalTerminal() {
  const { connectLocal } = useSessions()
  const addLocalTab = useTabStore((state) => state.addLocalTab)
  const addSession = useSessionStore((state) => state.addSession)
  const [localTerminalLoading, setLocalTerminalLoading] = useState(false)

  const handleNewLocalTerminal = useCallback(async () => {
    setLocalTerminalLoading(true)
    try {
      const session = await connectLocal()
      addSession(session)
      addLocalTab(session)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to open local terminal')
    } finally {
      setLocalTerminalLoading(false)
    }
  }, [connectLocal, addSession, addLocalTab])

  return useMemo(
    () => ({
      localTerminalLoading,
      handleNewLocalTerminal,
    }),
    [localTerminalLoading, handleNewLocalTerminal]
  )
}
