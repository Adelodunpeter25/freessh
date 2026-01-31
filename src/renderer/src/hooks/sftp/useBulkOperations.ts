import { useCallback } from 'react'
import { toast } from 'sonner'
import { sftpService } from '../../services/ipc'

export const useBulkOperations = (sessionId: string | null, currentPath: string, onComplete?: () => void) => {
  const bulkDelete = useCallback(async (fileNames: string[]) => {
    if (!sessionId || fileNames.length === 0) return

    const toastId = toast.loading(`Deleting ${fileNames.length} item(s)...`)
    let successCount = 0
    let failCount = 0

    try {
      for (const fileName of fileNames) {
        const filePath = `${currentPath}/${fileName}`
        try {
          await sftpService.deleteFile(sessionId, filePath)
          successCount++
        } catch (err) {
          console.error(`Failed to delete ${fileName}:`, err)
          failCount++
        }
      }

      if (failCount === 0) {
        toast.success(`Deleted ${successCount} item(s)`, { id: toastId })
      } else {
        toast.warning(`Deleted ${successCount}, failed ${failCount}`, { id: toastId })
      }

      if (onComplete) onComplete()
    } catch (err) {
      toast.error('Bulk delete failed', { id: toastId })
    }
  }, [sessionId, currentPath, onComplete])

  const bulkDownload = useCallback(async (fileNames: string[], localDir: string) => {
    if (!sessionId || fileNames.length === 0) return

    const toastId = toast.loading(`Downloading ${fileNames.length} file(s)...`)
    let successCount = 0
    let failCount = 0

    try {
      for (const fileName of fileNames) {
        const remotePath = `${currentPath}/${fileName}`
        const localPath = await window.electron.ipcRenderer.invoke('path:join', localDir, fileName)
        
        try {
          await sftpService.download(sessionId, remotePath, localPath)
          successCount++
        } catch (err) {
          console.error(`Failed to download ${fileName}:`, err)
          failCount++
        }
      }

      if (failCount === 0) {
        toast.success(`Downloaded ${successCount} file(s)`, { id: toastId })
      } else {
        toast.warning(`Downloaded ${successCount}, failed ${failCount}`, { id: toastId })
      }
    } catch (err) {
      toast.error('Bulk download failed', { id: toastId })
    }
  }, [sessionId, currentPath])

  return {
    bulkDelete,
    bulkDownload
  }
}
