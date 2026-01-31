import { useCallback } from 'react'
import { toast } from 'sonner'
import { remoteSftpService } from '../../services/ipc'
import { TransferProgress } from '../../types'

export const useRemoteTransfer = (
  onComplete?: () => void,
  setTransfers?: React.Dispatch<React.SetStateAction<Map<string, TransferProgress>>>
) => {
  const bulkRemoteTransfer = useCallback(async (
    sourceSessionId: string,
    destSessionId: string,
    sourcePaths: string[],
    destDir: string
  ) => {
    if (sourcePaths.length === 0) return

    const transferId = `remote-${Date.now()}`
    
    // Add to transfer queue
    if (setTransfers) {
      setTransfers(prev => new Map(prev).set(transferId, {
        transfer_id: transferId,
        filename: `${sourcePaths.length} item(s)`,
        total: 100,
        transferred: 0,
        percentage: 0,
        status: 'uploading'
      }))
    }
    
    try {
      const results = await remoteSftpService.bulkRemoteTransfer(
        sourceSessionId,
        destSessionId,
        sourcePaths,
        destDir,
        (progress) => {
          if (setTransfers) {
            const percent = progress.total_items > 0
              ? Math.round((progress.completed_items / progress.total_items) * 100)
              : 0
            setTransfers(prev => new Map(prev).set(transferId, {
              transfer_id: transferId,
              filename: `${progress.completed_items}/${progress.total_items} items`,
              total: progress.total_items,
              transferred: progress.completed_items,
              percentage: percent,
              status: 'uploading'
            }))
          }
        }
      )

      const successCount = results.filter(r => r.success).length
      const failCount = results.filter(r => !r.success).length

      if (setTransfers) {
        if (failCount === 0) {
          setTransfers(prev => new Map(prev).set(transferId, {
            transfer_id: transferId,
            filename: `${successCount} item(s)`,
            total: results.length,
            transferred: results.length,
            percentage: 100,
            status: 'completed'
          }))
        } else {
          setTransfers(prev => new Map(prev).set(transferId, {
            transfer_id: transferId,
            filename: `${successCount} succeeded, ${failCount} failed`,
            total: results.length,
            transferred: successCount,
            percentage: 100,
            status: 'failed'
          }))
        }
      }

      if (failCount === 0) {
        toast.success(`Transferred ${successCount} item(s)`)
      } else {
        toast.warning(`Transferred ${successCount}, failed ${failCount}`)
      }

      if (onComplete) onComplete()
    } catch (err) {
      if (setTransfers) {
        setTransfers(prev => new Map(prev).set(transferId, {
          transfer_id: transferId,
          filename: `${sourcePaths.length} item(s)`,
          total: sourcePaths.length,
          transferred: 0,
          percentage: 0,
          status: 'failed'
        }))
      }
      toast.error('Bulk transfer failed')
    }
  }, [onComplete, setTransfers])

  const cancelRemoteTransfer = useCallback(async (transferId: string) => {
    try {
      const cancelled = await remoteSftpService.cancelRemoteTransfer(transferId)
      if (cancelled && setTransfers) {
        setTransfers(prev => {
          const next = new Map(prev)
          next.delete(transferId)
          return next
        })
        toast.info('Transfer cancelled')
      }
      return cancelled
    } catch (err) {
      toast.error('Failed to cancel transfer')
      return false
    }
  }, [setTransfers])

  return {
    bulkRemoteTransfer,
    cancelRemoteTransfer
  }
}
