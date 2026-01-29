import { useState, useEffect } from 'react'
import { logService } from '@/services/ipc'
import { LogEntry } from '@/types/log'
import { toast } from 'sonner'

export function useLogs() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [loading, setLoading] = useState(true)

  const loadLogs = async () => {
    try {
      setLoading(true)
      const data = await logService.list()
      setLogs(data)
    } catch (error) {
      toast.error('Failed to load logs')
    } finally {
      setLoading(false)
    }
  }

  const deleteLog = async (filename: string) => {
    try {
      logService.delete(filename)
      setLogs(logs.filter(log => log.filename !== filename))
      toast.success('Log deleted')
    } catch (error) {
      toast.error('Failed to delete log')
    }
  }

  const deleteAllLogs = async () => {
    try {
      await logService.deleteAll()
      setLogs([])
      toast.success('All logs deleted')
    } catch (error) {
      toast.error('Failed to delete logs')
    }
  }

  useEffect(() => {
    loadLogs()
  }, [])

  return { logs, loading, loadLogs, deleteLog, deleteAllLogs }
}
