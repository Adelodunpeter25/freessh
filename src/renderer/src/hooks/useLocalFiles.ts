import { useState, useCallback, useEffect } from 'react'
import { FileInfo } from '@/types'

export function useLocalFiles() {
  const [files, setFiles] = useState<FileInfo[]>([])
  const [currentPath, setCurrentPath] = useState('')
  const [loading, setLoading] = useState(false)

  const loadFiles = useCallback(async (path: string) => {
    setLoading(true)
    try {
      const entries = await window.electron.ipcRenderer.invoke('fs:readdir', path)
      setFiles(entries)
      setCurrentPath(path)
    } catch (error) {
      console.error('Failed to load local files:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const homePath = window.electron.process.env.HOME || '/'
    loadFiles(homePath)
  }, [loadFiles])

  const navigate = useCallback((path: string) => {
    loadFiles(path)
  }, [loadFiles])

  const refresh = useCallback(() => {
    loadFiles(currentPath)
  }, [loadFiles, currentPath])

  const deleteFile = useCallback(async (path: string): Promise<void> => {
    await window.electron.ipcRenderer.invoke('fs:delete', path)
    refresh()
  }, [refresh])

  const rename = useCallback(async (oldPath: string, newPath: string) => {
    try {
      await window.electron.ipcRenderer.invoke('fs:rename', oldPath, newPath)
      refresh()
    } catch (error) {
      console.error('Failed to rename:', error)
    }
  }, [refresh])

  const mkdir = useCallback(async (path: string) => {
    try {
      await window.electron.ipcRenderer.invoke('fs:mkdir', path)
      refresh()
    } catch (error) {
      console.error('Failed to create folder:', error)
    }
  }, [refresh])

  const chmod = useCallback(async (path: string, mode: number) => {
    await window.electron.ipcRenderer.invoke('fs:chmod', path, mode)
    refresh()
  }, [refresh])

  const listPath = useCallback(async (path: string): Promise<FileInfo[]> => {
    return window.electron.ipcRenderer.invoke('fs:readdir', path)
  }, [])

  return { files, currentPath, loading, navigate, refresh, deleteFile, rename, mkdir, chmod, listPath }
}
