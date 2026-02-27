import { useCallback, useRef, useEffect } from 'react'
import { terminalService } from '../../services/ipc'
import { backendService } from '../../services/ipc/backend'
import { terminalScrollbackStorage } from '@/services/storage/terminalScrollbackStorage'

export const useTerminal = (sessionId: string | null) => {
  const xtermRef = useRef<any>(null)
  const cleanedUpRef = useRef(false)
  const pendingInitialBufferRef = useRef('')
  const pendingLiveBeforeRestoreRef = useRef('')
  const restoredRef = useRef(false)
  const pendingPersistChunkRef = useRef('')
  const flushTimerRef = useRef<number | null>(null)

  const flushPersistChunk = useCallback(() => {
    if (!sessionId) return
    const chunk = pendingPersistChunkRef.current
    if (!chunk) return
    pendingPersistChunkRef.current = ''

    void terminalScrollbackStorage.append(sessionId, chunk).catch(() => {
      // Best-effort persistence; terminal rendering must keep working even if storage fails.
    })
  }, [sessionId])

  const schedulePersistFlush = useCallback(() => {
    if (flushTimerRef.current !== null) return
    flushTimerRef.current = window.setTimeout(() => {
      flushTimerRef.current = null
      flushPersistChunk()
    }, 200)
  }, [flushPersistChunk])

  const restoreScrollback = useCallback(async () => {
    if (!sessionId) return
    const content = await terminalScrollbackStorage.load(sessionId)
    const combined = `${content || ''}${pendingLiveBeforeRestoreRef.current}`
    pendingLiveBeforeRestoreRef.current = ''
    restoredRef.current = true
    if (!combined) return

    if (xtermRef.current) {
      xtermRef.current.write(combined)
    } else {
      pendingInitialBufferRef.current = combined
    }
  }, [sessionId])

  const setXterm = useCallback((xterm: any) => {
    xtermRef.current = xterm
    if (pendingInitialBufferRef.current) {
      xtermRef.current.write(pendingInitialBufferRef.current)
      pendingInitialBufferRef.current = ''
    }
  }, [])

  useEffect(() => {
    if (!sessionId) return
    cleanedUpRef.current = false
    restoredRef.current = false
    pendingPersistChunkRef.current = ''
    pendingInitialBufferRef.current = ''
    pendingLiveBeforeRestoreRef.current = ''
    void restoreScrollback().catch(() => {
      const fallback = pendingLiveBeforeRestoreRef.current
      pendingLiveBeforeRestoreRef.current = ''
      restoredRef.current = true
      if (fallback) {
        if (xtermRef.current) {
          xtermRef.current.write(fallback)
        } else {
          pendingInitialBufferRef.current = fallback
        }
      }
    })

    const handlerKey = `output:${sessionId}`
    const handler = (message: any) => {
      const output = message?.data?.output || ''
      if (!output || cleanedUpRef.current) return

      if (restoredRef.current) {
        if (xtermRef.current) {
          xtermRef.current.write(output)
        }
      } else {
        pendingLiveBeforeRestoreRef.current += output
      }
      pendingPersistChunkRef.current += output
      schedulePersistFlush()
    }
    backendService.on(handlerKey, handler)

    return () => {
      cleanedUpRef.current = true
      if (flushTimerRef.current !== null) {
        window.clearTimeout(flushTimerRef.current)
        flushTimerRef.current = null
      }
      flushPersistChunk()
      backendService.off(handlerKey, handler)
    }
  }, [sessionId, flushPersistChunk, restoreScrollback, schedulePersistFlush])

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
