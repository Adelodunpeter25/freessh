import { useCallback, useRef, useEffect } from 'react'
import { terminalService } from '../../services/ipc'
import { backendService } from '../../services/ipc/backend'

export const useTerminal = (sessionId: string | null) => {
  const xtermRef = useRef<any>(null)
  const cleanedUpRef = useRef(false)

  const setXterm = useCallback((xterm: any) => {
    xtermRef.current = xterm
  }, [])

  useEffect(() => {
    if (!sessionId) return
    cleanedUpRef.current = false

    const handlerKey = `output:${sessionId}`
    const handler = (message: any) => {
      if (!cleanedUpRef.current && xtermRef.current) {
        xtermRef.current.write(message.data.output)
      }
    }
    backendService.on(handlerKey, handler)

    return () => {
      cleanedUpRef.current = true
      backendService.off(handlerKey)
    }
  }, [sessionId])

  const sendInput = useCallback((data: string) => {
    if (sessionId) {
      terminalService.sendInput(sessionId, data)
    }
  }, [sessionId])

  // xterm provides (cols, rows), backend expects (rows, cols)
  const resize = useCallback((cols: number, rows: number) => {
    if (sessionId) {
      terminalService.resize(sessionId, rows, cols)
    }
  }, [sessionId])

  return { sendInput, resize, setXterm }
}
