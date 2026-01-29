import { useState, useCallback } from 'react'
import { FileInfo } from '@/types'
import { isImageFile, isTextFile } from '@/utils/fileTypes'

interface PreviewState {
  file: FileInfo
  isRemote: boolean
}

export const useFilePreview = (
  readRemoteFile: (path: string, binary?: boolean) => Promise<string>,
  writeRemoteFile: (path: string, content: string) => Promise<void>
) => {
  const [previewFile, setPreviewFile] = useState<PreviewState | null>(null)
  const [previewContent, setPreviewContent] = useState<string | null>(null)
  const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)

  const openFile = useCallback(async (file: FileInfo, isRemote: boolean) => {
    if (file.is_dir) return
    if (!isTextFile(file.name) && !isImageFile(file.name)) return

    setPreviewFile({ file, isRemote })
    setPreviewLoading(true)
    setPreviewContent(null)
    setPreviewBlobUrl(prev => {
      if (prev) URL.revokeObjectURL(prev)
      return null
    })

    try {
      if (isTextFile(file.name)) {
        const content = isRemote 
          ? await readRemoteFile(file.path)
          : await window.electron.ipcRenderer.invoke('fs:readfile', file.path)
        setPreviewContent(content)
      } else if (isImageFile(file.name)) {
        if (isRemote) {
          const base64 = await readRemoteFile(file.path, true)
          const binary = atob(base64)
          const bytes = new Uint8Array(binary.length)
          for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i)
          }
          const blob = new Blob([bytes])
          setPreviewBlobUrl(URL.createObjectURL(blob))
        } else {
          setPreviewBlobUrl(`file://${file.path}`)
        }
      }
    } catch (err) {
      console.error('Failed to read file:', err)
    } finally {
      setPreviewLoading(false)
    }
  }, [readRemoteFile])

  const saveFile = useCallback(async (content: string) => {
    if (!previewFile) return
    
    if (previewFile.isRemote) {
      await writeRemoteFile(previewFile.file.path, content)
    } else {
      await window.electron.ipcRenderer.invoke('fs:writefile', previewFile.file.path, content)
    }
    setPreviewContent(content)
  }, [previewFile, writeRemoteFile])

  const closePreview = useCallback(() => {
    setPreviewBlobUrl(prev => {
      if (prev) URL.revokeObjectURL(prev)
      return null
    })
    setPreviewFile(null)
    setPreviewContent(null)
  }, [])

  return {
    previewFile: previewFile?.file ?? null,
    isRemotePreview: previewFile?.isRemote ?? false,
    previewContent,
    previewBlobUrl,
    previewLoading,
    openFile,
    saveFile,
    closePreview,
  }
}
