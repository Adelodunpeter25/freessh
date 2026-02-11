import { useState, useEffect } from 'react'
import { historyService } from '@renderer/services/ipc/history'
import { backendService } from '@renderer/services/ipc/backend'
import { toast } from 'sonner'
import type { HistoryEntry } from '@renderer/types/history'
import type { IPCMessage } from '@renderer/types'

export function useHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [loading, setLoading] = useState(true)

  const loadHistory = async () => {
    try {
      const entries = await historyService.list()
      setHistory(entries)
    } catch (error) {
      toast.error('Failed to load history')
    } finally {
      setLoading(false)
    }
  }

  const clearHistory = async () => {
    try {
      await historyService.clear()
      setHistory([])
      toast.success('History cleared')
    } catch (error) {
      toast.error('Failed to clear history')
    }
  }

  useEffect(() => {
    loadHistory()

    const handleHistoryAdd = (message: IPCMessage) => {
      if (message.type !== 'history:add' || !message.data?.entry) return
      const entry = message.data.entry as HistoryEntry
      setHistory((prev) => {
        const withoutDuplicate = prev.filter((item) => item.id !== entry.id)
        return [entry, ...withoutDuplicate]
      })
    }

    backendService.on('history:add', handleHistoryAdd)

    return () => {
      backendService.off('history:add')
    }
  }, [])

  return { history, loading, clearHistory, refresh: loadHistory }
}
