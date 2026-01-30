import { useState, useCallback } from 'react'
import { importFreeSSHService } from '@/services/ipc/import'
import { toast } from 'sonner'

export const useImport = () => {
  const [importing, setImporting] = useState(false)

  const importFreeSSH = useCallback(async (file: File) => {
    setImporting(true)
    try {
      const arrayBuffer = await file.arrayBuffer()
      const data = new Uint8Array(arrayBuffer)
      
      const result = await importFreeSSHService.import(data)
      
      const messages = [
        `${result.connections_imported} connections`,
        `${result.groups_imported} groups`,
        `${result.port_forwards_imported} port forwards`
      ]
      
      if (result.errors && result.errors.length > 0) {
        toast.warning(`Import completed with errors: ${messages.join(', ')}`)
        console.error('Import errors:', result.errors)
      } else {
        toast.success(`Imported: ${messages.join(', ')}`)
      }
      
      return result
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to import'
      toast.error(errorMsg)
      throw error
    } finally {
      setImporting(false)
    }
  }, [])

  return {
    importing,
    importFreeSSH
  }
}
