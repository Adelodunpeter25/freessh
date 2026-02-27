import { createContext, useContext, ReactNode } from 'react'
import { FileInfo } from '@/types'

interface FilePreviewContextType {
  previewFile: FileInfo | null
  isRemotePreview: boolean
  previewContent: string | null
  previewBlobUrl: string | null
  previewLoading: boolean
  openFile: (file: FileInfo, isRemote: boolean, sessionId?: string) => Promise<void>
  saveFile: (content: string) => Promise<void>
  closePreview: () => void
}

const FilePreviewContext = createContext<FilePreviewContextType | null>(null)

export const FilePreviewProvider = ({ 
  children, 
  value 
}: { 
  children: ReactNode
  value: FilePreviewContextType 
}) => {
  return (
    <FilePreviewContext.Provider value={value}>
      {children}
    </FilePreviewContext.Provider>
  )
}

export const useFilePreviewContext = () => {
  const context = useContext(FilePreviewContext)
  if (!context) {
    throw new Error('useFilePreviewContext must be used within FilePreviewProvider')
  }
  return context
}
