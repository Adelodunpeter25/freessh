import { useCallback } from 'react'
import { toast } from 'sonner'
import { sftpService } from '../../services/ipc'
import { TransferProgress } from '../../types'

export const useSFTPTransfer = (
  sessionId: string | null,
  currentPath: string,
  listFiles: (path: string) => Promise<void>,
  setTransfers: React.Dispatch<React.SetStateAction<Map<string, TransferProgress>>>,
  setError: (error: string | null) => void
) => {
  const upload = useCallback(async (localPath: string, remotePath: string) => {
    if (!sessionId) return

    setError(null)
    let lastTransferId: string | null = null
    
    try {
      await sftpService.upload(sessionId, localPath, remotePath, (progress) => {
        lastTransferId = progress.transfer_id
        setTransfers(prev => new Map(prev).set(progress.transfer_id, progress))
      })
      if (lastTransferId) {
        setTransfers(prev => {
          const next = new Map(prev)
          const t = next.get(lastTransferId!)
          if (t) next.set(lastTransferId!, { ...t, status: 'completed', percentage: 100 })
          return next
        })
      }
      await listFiles(currentPath)
      toast.success('Upload completed')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed'
      setError(errorMessage)
      toast.error(errorMessage)
      if (lastTransferId) {
        setTransfers(prev => {
          const next = new Map(prev)
          const t = next.get(lastTransferId!)
          if (t) next.set(lastTransferId!, { ...t, status: 'failed' })
          return next
        })
      }
      throw err
    }
  }, [sessionId, currentPath, listFiles, setTransfers, setError])

  const download = useCallback(async (remotePath: string, localPath: string) => {
    if (!sessionId) return

    setError(null)
    let lastTransferId: string | null = null
    
    try {
      await sftpService.download(sessionId, remotePath, localPath, (progress) => {
        lastTransferId = progress.transfer_id
        setTransfers(prev => new Map(prev).set(progress.transfer_id, progress))
      })
      if (lastTransferId) {
        setTransfers(prev => {
          const next = new Map(prev)
          const t = next.get(lastTransferId!)
          if (t) next.set(lastTransferId!, { ...t, status: 'completed', percentage: 100 })
          return next
        })
      }
      toast.success('Download completed')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Download failed'
      setError(errorMessage)
      toast.error(errorMessage)
      if (lastTransferId) {
        setTransfers(prev => {
          const next = new Map(prev)
          const t = next.get(lastTransferId!)
          if (t) next.set(lastTransferId!, { ...t, status: 'failed' })
          return next
        })
      }
      throw err
    }
  }, [sessionId, setTransfers, setError])

  const cancelTransfer = useCallback(async (transferId: string) => {
    if (!sessionId) return false
    const cancelled = await sftpService.cancel(sessionId, transferId)
    if (cancelled) {
      setTransfers(prev => {
        const next = new Map(prev)
        next.delete(transferId)
        return next
      })
    }
    return cancelled
  }, [sessionId, setTransfers])

  const clearCompleted = useCallback(() => {
    setTransfers(prev => {
      const next = new Map(prev)
      for (const [id, t] of next) {
        if (t.status === 'completed' || t.status === 'failed') {
          next.delete(id)
        }
      }
      return next
    })
  }, [setTransfers])

  const downloadToTemp = useCallback(async (remotePath: string, filename: string): Promise<string> => {
    if (!sessionId) throw new Error('No session')
    
    const tempDir = await window.electron.ipcRenderer.invoke('fs:getTempDir')
    const path = await window.electron.ipcRenderer.invoke('path:join', tempDir, filename)
    
    let lastTransferId: string | null = null
    const toastId = toast.loading(`Downloading ${filename}...`)
    
    try {
      await sftpService.download(sessionId, remotePath, path, (progress) => {
        lastTransferId = progress.transfer_id
        setTransfers(prev => new Map(prev).set(progress.transfer_id, progress))
        toast.loading(`Downloading ${filename}... ${progress.percentage}%`, { id: toastId })
      })
      
      if (lastTransferId) {
        setTransfers(prev => {
          const next = new Map(prev)
          next.delete(lastTransferId!)
          return next
        })
      }
      
      toast.success(`Downloaded ${filename}`, { id: toastId })
      return path
    } catch (err) {
      if (lastTransferId) {
        setTransfers(prev => {
          const next = new Map(prev)
          next.delete(lastTransferId!)
          return next
        })
      }
      toast.error('Download failed', { id: toastId })
      throw err
    }
  }, [sessionId, setTransfers])

  return {
    upload,
    download,
    downloadToTemp,
    cancelTransfer,
    clearCompleted
  }
}
