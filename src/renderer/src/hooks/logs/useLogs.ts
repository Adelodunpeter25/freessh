import { useState, useEffect } from 'react'
import { logService } from '@/services/ipc'
import { LogEntry } from '@/types/log'
import { toast } from 'sonner'

export function useLogs() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null)
  const [logContent, setLogContent] = useState<string>('')
  const [loadingContent, setLoadingContent] = useState(false)

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

  const openLog = async (log: LogEntry) => {
    try {
      setLoadingContent(true)
      const content = await logService.read(log.filename)
      setLogContent(content)
      setSelectedLog(log)
    } catch (error) {
      toast.error('Failed to load log content')
    } finally {
      setLoadingContent(false)
    }
  }

  const closeLog = () => {
    setSelectedLog(null)
    setLogContent('')
  }

  useEffect(() => {
    loadLogs()
  }, [])

  return { 
    logs, 
    loading, 
    loadLogs, 
    deleteLog, 
    selectedLog, 
    logContent, 
    loadingContent, 
    openLog, 
    closeLog 
  }
}
