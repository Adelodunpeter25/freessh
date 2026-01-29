import { useState, useEffect } from 'react'
import { backendService } from '@/services/ipc/backend'
import { terminalService } from '@/services/ipc/terminal'
import { IPCMessage, LoggingStatusResponse } from '@/types'

export function useTerminalLogging(sessionId: string) {
  const [isRecording, setIsRecording] = useState(false)
  const [logFilePath, setLogFilePath] = useState<string>()

  useEffect(() => {
    const handler = (msg: IPCMessage) => {
      const data = msg.data as LoggingStatusResponse
      setIsRecording(data.is_logging)
      setLogFilePath(data.file_path)
    }

    backendService.on(`terminal:logging_status:${sessionId}`, handler)
    return () => backendService.off(`terminal:logging_status:${sessionId}`)
  }, [sessionId])

  const startLogging = () => terminalService.startLogging(sessionId)
  const stopLogging = () => terminalService.stopLogging(sessionId)

  return { isRecording, logFilePath, startLogging, stopLogging }
}
