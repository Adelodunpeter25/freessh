import { useState, useCallback, useRef } from 'react'
import { toast } from 'sonner'
import { FileInfo } from '@/types'
import { isImageFile, isTextFile } from '@/utils/fileTypes'
import { sftpService } from '@/services/ipc'

interface PreviewState {
  file: FileInfo
  isRemote: boolean
  sessionId?: string
}

export const useFilePreview = () => {
  const [previewFile, setPreviewFile] = useState<PreviewState | null>(null)
  const [previewContent, setPreviewContent] = useState<string | null>(null)
  const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const textPreviewCache = useRef<Map<string, string>>(new Map())

  const getCacheKey = (file: FileInfo, isRemote: boolean, sessionId?: string) =>
    `${isRemote ? `remote:${sessionId ?? 'none'}` : 'local'}:${file.path}`

  const openFile = useCallback(async (file: FileInfo, isRemote: boolean, sessionId?: string) => {
    if (file.is_dir) return
    if (!isTextFile(file.name) && !isImageFile(file.name)) return

    if (isRemote && !sessionId) {
      toast.error('Failed to load preview: No session')
      return
    }

    setPreviewFile({ file, isRemote, sessionId })
    setPreviewContent(null)
    setPreviewBlobUrl(prev => {
      if (prev) URL.revokeObjectURL(prev)
      return null
    })

    try {
      if (isTextFile(file.name)) {
        const cacheKey = getCacheKey(file, isRemote, sessionId)
        const cached = textPreviewCache.current.get(cacheKey)
        if (cached !== undefined) {
          setPreviewContent(cached)
          setPreviewLoading(false)
          return
        }

        setPreviewLoading(true)
        const content = isRemote 
          ? await sftpService.readFile(sessionId!, file.path)
          : await window.electron.ipcRenderer.invoke('fs:readfile', file.path)
        textPreviewCache.current.set(cacheKey, content)
        if (textPreviewCache.current.size > 50) {
          const firstKey = textPreviewCache.current.keys().next().value
          if (firstKey) textPreviewCache.current.delete(firstKey)
        }
        setPreviewContent(content)
      } else if (isImageFile(file.name)) {
        setPreviewLoading(true)
        if (isRemote) {
          const base64 = await sftpService.readFile(sessionId!, file.path, true)
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
    } catch (err: any) {
      console.error('Failed to read file:', err)
      const errorMsg = err?.message || String(err)
      if (errorMsg.includes('too large to preview')) {
        toast.error('File too large to preview (>5MB)')
      } else {
        toast.error(`Failed to load preview: ${errorMsg}`)
      }
      setPreviewFile(null)
    } finally {
      setPreviewLoading(false)
    }
  }, [])

  const saveFile = useCallback(async (content: string) => {
    if (!previewFile) return
    
    if (previewFile.isRemote) {
      if (!previewFile.sessionId) throw new Error('No session')
      await sftpService.writeFile(previewFile.sessionId, previewFile.file.path, content)
    } else {
      await window.electron.ipcRenderer.invoke('fs:writefile', previewFile.file.path, content)
    }
    textPreviewCache.current.set(
      getCacheKey(previewFile.file, previewFile.isRemote, previewFile.sessionId),
      content
    )
    setPreviewContent(content)
  }, [previewFile])

  const closePreview = useCallback(() => {
    setPreviewBlobUrl(prev => {
      if (prev) URL.revokeObjectURL(prev)
      return null
    })
    setPreviewFile(null)
    setPreviewContent(null)
    setPreviewLoading(false)
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
