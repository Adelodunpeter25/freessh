import { useState, useCallback } from 'react'
import { toast } from 'sonner'
import { sftpService } from '../services/ipc'
import { FileInfo, TransferProgress } from '../types'

export const useSFTP = (sessionId: string | null) => {
  const [files, setFiles] = useState<FileInfo[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPath, setCurrentPath] = useState('/')
  const [transfers, setTransfers] = useState<Map<string, TransferProgress>>(new Map())

  const listFiles = useCallback(async (path: string) => {
    if (!sessionId) return

    setLoading(true)
    setError(null)
    
    try {
      const data = await sftpService.list(sessionId, path)
      setFiles(data)
      setCurrentPath(path)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to list files'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [sessionId])

  const listPath = useCallback(async (path: string): Promise<FileInfo[]> => {
    if (!sessionId) return []
    return sftpService.list(sessionId, path)
  }, [sessionId])

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
  }, [sessionId, currentPath, listFiles])

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
  }, [sessionId])

  const deleteFile = useCallback(async (path: string) => {
    if (!sessionId) return

    try {
      await sftpService.delete(sessionId, path)
      await listFiles(currentPath)
      toast.success('File deleted successfully')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Delete failed'
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    }
  }, [sessionId, currentPath, listFiles])

  const createDirectory = useCallback(async (path: string) => {
    if (!sessionId) return

    try {
      await sftpService.mkdir(sessionId, path)
      await listFiles(currentPath)
      toast.success('Folder created successfully')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Create directory failed'
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    }
  }, [sessionId, currentPath, listFiles])

  const rename = useCallback(async (oldPath: string, newPath: string) => {
    if (!sessionId) return

    try {
      await sftpService.rename(sessionId, oldPath, newPath)
      await listFiles(currentPath)
      toast.success('Renamed successfully')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Rename failed'
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    }
  }, [sessionId, currentPath, listFiles])

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
  }, [sessionId])

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
  }, [])

  const readFile = useCallback(async (path: string, binary?: boolean): Promise<string> => {
    if (!sessionId) throw new Error('No session')
    return sftpService.readFile(sessionId, path, binary)
  }, [sessionId])

  const writeFile = useCallback(async (path: string, content: string): Promise<void> => {
    if (!sessionId) throw new Error('No session')
    try {
      await sftpService.writeFile(sessionId, path, content)
      toast.success('File saved successfully')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Save failed'
      toast.error(errorMessage)
      throw err
    }
  }, [sessionId])

  const chmod = useCallback(async (path: string, mode: number): Promise<void> => {
    if (!sessionId) throw new Error('No session')
    try {
      await sftpService.chmod(sessionId, path, mode)
      await listFiles(currentPath)
      toast.success('Permissions updated successfully')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Chmod failed'
      toast.error(errorMessage)
      throw err
    }
  }, [sessionId, currentPath, listFiles])

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
  }, [sessionId])

  return {
    files,
    loading,
    error,
    currentPath,
    transfers: Array.from(transfers.values()),
    listFiles,
    listPath,
    upload,
    download,
    downloadToTemp,
    deleteFile,
    createDirectory,
    rename,
    chmod,
    cancelTransfer,
    clearCompleted,
    readFile,
    writeFile
  }
}
