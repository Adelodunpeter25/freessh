import { useState, useCallback } from 'react'
import { sftpService } from '../../services/ipc'
import { FileInfo, TransferProgress } from '../../types'
import { useSFTPTransfer } from './useSFTPTransfer'
import { useSFTPOperations } from './useSFTPOperations'
import { useSFTPFile } from './useSFTPFile'

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

  const transferOps = useSFTPTransfer(sessionId, currentPath, listFiles, setTransfers, setError)
  const fileOps = useSFTPOperations(sessionId, currentPath, files, listFiles, setError)
  const fileReadWrite = useSFTPFile(sessionId)

  return {
    files,
    loading,
    error,
    currentPath,
    transfers: Array.from(transfers.values()),
    setTransfers,
    listFiles,
    listPath,
    ...transferOps,
    ...fileOps,
    ...fileReadWrite
  }
}
