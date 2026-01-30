import { useState, useCallback } from 'react'
import { exportFreeSSHService } from '@/services/ipc/export'
import { toast } from 'sonner'

export const useExport = () => {
  const [exporting, setExporting] = useState(false)

  const exportFreeSSH = useCallback(async () => {
    setExporting(true)
    try {
      const result = await exportFreeSSHService.export()
      
      // Decode base64 data
      const jsonString = atob(String.fromCharCode(...result.data))
      
      // Create blob and download
      const blob = new Blob([jsonString], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = result.filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      toast.success('Export completed')
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to export'
      toast.error(errorMsg)
      throw error
    } finally {
      setExporting(false)
    }
  }, [])

  return {
    exporting,
    exportFreeSSH
  }
}
