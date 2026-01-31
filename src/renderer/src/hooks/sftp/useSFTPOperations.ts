import { useCallback } from 'react'
import { toast } from 'sonner'
import { sftpService } from '../../services/ipc'
import { FileInfo } from '../../types'

export const useSFTPOperations = (
  sessionId: string | null,
  currentPath: string,
  files: FileInfo[],
  listFiles: (path: string) => Promise<void>,
  setError: (error: string | null) => void
) => {
  const deleteFile = useCallback(async (path: string) => {
    if (!sessionId) return

    const file = files.find(f => f.path === path)
    const itemType = file?.is_dir ? 'Folder' : 'File'

    try {
      await sftpService.delete(sessionId, path)
      await listFiles(currentPath)
      toast.success(`${itemType} deleted successfully`)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Delete failed'
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    }
  }, [sessionId, currentPath, listFiles, files, setError])

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
  }, [sessionId, currentPath, listFiles, setError])

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
  }, [sessionId, currentPath, listFiles, setError])

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

  return {
    deleteFile,
    createDirectory,
    rename,
    chmod
  }
}
