import { useState, useCallback } from 'react'
import { exportFreeSSHService, exportOpenSSHService } from '@/services/ipc/export'
import { toast } from 'sonner'

export const useExport = () => {
  const [exporting, setExporting] = useState(false)

  const exportFreeSSH = useCallback(async () => {
    setExporting(true)
    try {
      const result = await exportFreeSSHService.export()
      
      // Data is already a string from IPC
      const jsonString = typeof result.data === 'string' ? result.data : JSON.stringify(result.data)
      
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

  const exportOpenSSH = useCallback(async () => {
    setExporting(true)
    try {
      const result = await exportOpenSSHService.export()
      
      // Create blob and download
      const blob = new Blob([result.data], { type: 'text/plain' })
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
    exportFreeSSH,
    exportOpenSSH
  }
}
