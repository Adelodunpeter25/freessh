import { useState, useEffect } from 'react'
import { historyService } from '@renderer/services/ipc/history'
import { toast } from 'sonner'
import type { HistoryEntry } from '@renderer/types/history'

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
  }, [])

  return { history, loading, clearHistory, refresh: loadHistory }
}
