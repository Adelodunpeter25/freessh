import { FileInfo } from '@/types'
import { shouldOpenInDefaultApp } from './fileTypes'
import { toast } from 'sonner'

interface OpenFileOptions {
  file: FileInfo
  isRemote: boolean
  sessionId?: string
  onOpenInEditor: (file: FileInfo) => void
  onDownloadToTemp: (remotePath: string, filename: string) => Promise<string>
}

export async function openFile(options: OpenFileOptions) {
  const { file, isRemote, sessionId, onOpenInEditor, onDownloadToTemp } = options

  // Text files (local + remote) open in built-in editor/preview.
  if (!shouldOpenInDefaultApp(file.name)) {
    onOpenInEditor(file)
    return
  }

  // Local binary files - open in default app
  if (!isRemote) {
    await window.electron.ipcRenderer.invoke('shell:openPath', file.path)
    return
  }

  // Remote files
  if (!sessionId) {
    toast.error('No active session')
    return
  }

  // Remote binary files - download and open in default app
  try {
    toast.info(`Opening ${file.name}...`)
    const tempPath = await onDownloadToTemp(file.path, file.name)
    await window.electron.ipcRenderer.invoke('shell:openPath', tempPath)
  } catch (error) {
    toast.error(error instanceof Error ? error.message : 'Failed to open file')
  }
}
