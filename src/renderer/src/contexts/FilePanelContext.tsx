import { createContext, useContext, ReactNode } from 'react'
import { FileInfo } from '@/types'

interface FilePanelContextValue {
  // File operations
  onDelete: (path: string) => Promise<void>
  onRename: (oldPath: string, newPath: string) => void
  onChmod: (path: string, mode: number) => Promise<void>
  onMkdir: (path: string) => void
  
  // Navigation
  onNavigate: (path: string) => void
  onRefresh: () => void
  
  // Drag and drop
  onDrop?: (files: FileInfo[], targetPath: string) => void
  onDragStart?: (file: FileInfo) => void
  
  // Selection
  selectedFile: FileInfo | null
  onSelectFile: (file: FileInfo | null) => void
  
  // Multi-select
  selectedItems?: Set<string>
  onItemSelect?: (items: FileInfo[], file: FileInfo, index: number, event: React.MouseEvent) => void
  isItemSelected?: (fileName: string) => boolean
  
  // State
  currentPath: string
  loading: boolean
  isRemote: boolean
  sessionId?: string
  transferActive?: boolean
  
  // Suggestions
  fetchSuggestions: (path: string) => Promise<FileInfo[]>
  
  // Remote file operations
  onDownloadToTemp?: (remotePath: string, filename: string) => Promise<string>
  
  // Title click
  onTitleClick?: () => void
}

const FilePanelContext = createContext<FilePanelContextValue | null>(null)

export function useFilePanelContext() {
  const context = useContext(FilePanelContext)
  if (!context) {
    throw new Error('useFilePanelContext must be used within FilePanelProvider')
  }
  return context
}

interface FilePanelProviderProps {
  children: ReactNode
  value: FilePanelContextValue
}

export function FilePanelProvider({ children, value }: FilePanelProviderProps) {
  return (
    <FilePanelContext.Provider value={value}>
      {children}
    </FilePanelContext.Provider>
  )
}
