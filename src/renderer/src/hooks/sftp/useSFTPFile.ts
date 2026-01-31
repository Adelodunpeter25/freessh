import { useCallback } from 'react'
import { toast } from 'sonner'
import { sftpService } from '../../services/ipc'

export const useSFTPFile = (sessionId: string | null) => {
  const readFile = useCallback(async (path: string, binary?: boolean): Promise<string> => {
    if (!sessionId) throw new Error('No session')
    return sftpService.readFile(sessionId, path, binary)
  }, [sessionId])

  const writeFile = useCallback(async (path: string, content: string): Promise<void> => {
    if (!sessionId) throw new Error('No session')
    try {
      await sftpService.writeFile(sessionId, path, content)
      toast.success('File saved successfully')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Save failed'
      toast.error(errorMessage)
      throw err
    }
  }, [sessionId])

  return {
    readFile,
    writeFile
  }
}
