import { useCallback } from 'react'
import { toast } from 'sonner'
import { remoteSftpService } from '../../services/ipc'

export const useRemoteTransfer = (onComplete?: () => void) => {
  const remoteTransfer = useCallback(async (
    sourceSessionId: string,
    destSessionId: string,
    sourcePath: string,
    destPath: string
  ) => {
    const toastId = toast.loading('Transferring file...')
    
    try {
      const result = await remoteSftpService.remoteTransfer(
        sourceSessionId,
        destSessionId,
        sourcePath,
        destPath,
        (progress) => {
          const percent = progress.total_bytes > 0 
            ? Math.round((progress.bytes_transferred / progress.total_bytes) * 100)
            : 0
          toast.loading(`Transferring... ${percent}%`, { id: toastId })
        }
      )

      if (result.success) {
        toast.success('Transfer completed', { id: toastId })
      } else {
        toast.error(`Transfer failed: ${result.error}`, { id: toastId })
      }

      if (onComplete) onComplete()
    } catch (err) {
      toast.error('Transfer failed', { id: toastId })
    }
  }, [onComplete])

  const bulkRemoteTransfer = useCallback(async (
    sourceSessionId: string,
    destSessionId: string,
    sourcePaths: string[],
    destDir: string
  ) => {
    if (sourcePaths.length === 0) return

    const toastId = toast.loading(`Transferring ${sourcePaths.length} item(s)...`)
    
    try {
      const results = await remoteSftpService.bulkRemoteTransfer(
        sourceSessionId,
        destSessionId,
        sourcePaths,
        destDir,
        (progress) => {
          toast.loading(`Transferring ${progress.completed_items}/${progress.total_items}...`, { id: toastId })
        }
      )

      const successCount = results.filter(r => r.success).length
      const failCount = results.filter(r => !r.success).length

      if (failCount === 0) {
        toast.success(`Transferred ${successCount} item(s)`, { id: toastId })
      } else {
        toast.warning(`Transferred ${successCount}, failed ${failCount}`, { id: toastId })
      }

      if (onComplete) onComplete()
    } catch (err) {
      toast.error('Bulk transfer failed', { id: toastId })
    }
  }, [onComplete])

  return {
    remoteTransfer,
    bulkRemoteTransfer
  }
}
