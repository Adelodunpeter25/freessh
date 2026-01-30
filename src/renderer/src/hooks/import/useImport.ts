import { useState, useCallback } from 'react'
import { importFreeSSHService, importOpenSSHService } from '@/services/ipc/import'
import { toast } from 'sonner'

export const useImport = () => {
  const [importing, setImporting] = useState(false)

  const importFreeSSH = useCallback(async (file: File) => {
    setImporting(true)
    try {
      const text = await file.text()
      const data = new TextEncoder().encode(text)
      
      const result = await importFreeSSHService.import(data)
      
      const messages = [
        `${result.connections_imported} connections`,
        `${result.groups_imported} groups`,
        `${result.port_forwards_imported} port forwards`,
        `${result.keys_imported} keys`
      ]
      
      if (result.errors && result.errors.length > 0) {
        const hasSkipped = result.errors.some(e => e.includes('already exists'))
        if (hasSkipped && result.errors.every(e => e.includes('already exists'))) {
          // All "errors" are just skipped items
          toast.success(`Imported: ${messages.join(', ')} (some items already existed)`)
        } else {
          toast.warning(`Import completed with issues: ${messages.join(', ')}`)
          console.error('Import errors:', result.errors)
        }
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

  const importOpenSSH = useCallback(async (file: File) => {
    setImporting(true)
    try {
      const text = await file.text()
      const data = new TextEncoder().encode(text)
      
      const result = await importOpenSSHService.import(data)
      
      const messages = [
        `${result.connections_imported} connections`,
        `${result.keys_imported} keys`
      ]
      
      if (result.errors && result.errors.length > 0) {
        const hasSkipped = result.errors.some(e => e.includes('already exists'))
        if (hasSkipped && result.errors.every(e => e.includes('already exists'))) {
          toast.success(`Imported: ${messages.join(', ')} (some items already existed)`)
        } else {
          toast.warning(`Import completed with issues: ${messages.join(', ')}`)
          console.error('Import errors:', result.errors)
        }
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
    importFreeSSH,
    importOpenSSH
  }
}
