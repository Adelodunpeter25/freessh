import { useCallback } from 'react'
import { toast } from 'sonner'
import { bulkSftpService } from '../../services/ipc'

export const useBulkOperations = (sessionId: string | null, currentPath: string, onComplete?: () => void) => {
  const bulkDelete = useCallback(async (fileNames: string[]) => {
    if (!sessionId || fileNames.length === 0) return

    const toastId = toast.loading(`Deleting ${fileNames.length} item(s)...`)
    
    try {
      const remotePaths = fileNames.map(name => `${currentPath}/${name}`)
      const results = await bulkSftpService.bulkDelete(sessionId, remotePaths, (progress) => {
        toast.loading(`Deleting ${progress.completed_items}/${progress.total_items}...`, { id: toastId })
      })

      const successCount = results.filter(r => r.success).length
      const failCount = results.filter(r => !r.success).length

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

    const toastId = toast.loading(`Downloading ${fileNames.length} item(s)...`)
    
    try {
      const remotePaths = fileNames.map(name => `${currentPath}/${name}`)
      const results = await bulkSftpService.bulkDownload(sessionId, remotePaths, localDir, (progress) => {
        toast.loading(`Downloading ${progress.completed_items}/${progress.total_items}...`, { id: toastId })
      })

      const successCount = results.filter(r => r.success).length
      const failCount = results.filter(r => !r.success).length

      if (failCount === 0) {
        toast.success(`Downloaded ${successCount} item(s)`, { id: toastId })
      } else {
        toast.warning(`Downloaded ${successCount}, failed ${failCount}`, { id: toastId })
      }

      if (onComplete) onComplete()
    } catch (err) {
      toast.error('Bulk download failed', { id: toastId })
    }
  }, [sessionId, currentPath, onComplete])

  const bulkUpload = useCallback(async (localPaths: string[], remoteDir: string) => {
    if (!sessionId || localPaths.length === 0) return

    const toastId = toast.loading(`Uploading ${localPaths.length} item(s)...`)
    
    try {
      const results = await bulkSftpService.bulkUpload(sessionId, localPaths, remoteDir, (progress) => {
        toast.loading(`Uploading ${progress.completed_items}/${progress.total_items}...`, { id: toastId })
      })

      const successCount = results.filter(r => r.success).length
      const failCount = results.filter(r => !r.success).length

      if (failCount === 0) {
        toast.success(`Uploaded ${successCount} item(s)`, { id: toastId })
      } else {
        toast.warning(`Uploaded ${successCount}, failed ${failCount}`, { id: toastId })
      }

      if (onComplete) onComplete()
    } catch (err) {
      toast.error('Bulk upload failed', { id: toastId })
    }
  }, [sessionId, onComplete])

  return {
    bulkDelete,
    bulkDownload,
    bulkUpload
  }
}
