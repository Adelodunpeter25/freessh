import { useState, useCallback, useEffect } from 'react'
import { toast } from 'sonner'
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
    try {
      await window.electron.ipcRenderer.invoke('fs:delete', path)
      refresh()
      toast.success('File deleted successfully')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Delete failed'
      toast.error(errorMessage)
      throw error
    }
  }, [refresh])

  const rename = useCallback(async (oldPath: string, newPath: string) => {
    try {
      await window.electron.ipcRenderer.invoke('fs:rename', oldPath, newPath)
      refresh()
      toast.success('Renamed successfully')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Rename failed'
      toast.error(errorMessage)
      throw error
    }
  }, [refresh])

  const mkdir = useCallback(async (path: string) => {
    try {
      await window.electron.ipcRenderer.invoke('fs:mkdir', path)
      refresh()
      toast.success('Folder created successfully')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Create folder failed'
      toast.error(errorMessage)
      throw error
    }
  }, [refresh])

  const chmod = useCallback(async (path: string, mode: number) => {
    try {
      await window.electron.ipcRenderer.invoke('fs:chmod', path, mode)
      refresh()
      toast.success('Permissions updated successfully')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Chmod failed'
      toast.error(errorMessage)
      throw error
    }
  }, [refresh])

  const listPath = useCallback(async (path: string): Promise<FileInfo[]> => {
    return window.electron.ipcRenderer.invoke('fs:readdir', path)
  }, [])

  return { files, currentPath, loading, navigate, refresh, deleteFile, rename, mkdir, chmod, listPath }
}
