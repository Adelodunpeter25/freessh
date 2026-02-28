import type { ReactNode } from 'react'
import type { WorkspaceTabModel } from '@/types/workspace'

export interface WorkspacePane {
  id: string
  tabId?: string
  children?: WorkspacePane[]
  direction?: 'horizontal' | 'vertical'
}

export interface WorkspaceShellProps {
  title?: string
  sidebar?: ReactNode
  content: ReactNode
  footer?: ReactNode
}

export interface WorkspaceSidebarProps {
  tabs: WorkspaceSidebarItem[]
  activeTabId: string | null
  onSelectTab?: (sessionId: string) => void
  onDropSession?: (sessionId: string, sourceTabId?: string) => void
  onDisconnectSession?: (sessionId: string) => void
  onOpenSFTP?: (sessionId: string) => void
  onRenameSession?: (sessionId: string, title: string) => void
  onTogglePin?: (sessionId: string) => void
  onSplitRight?: () => void
  onSplitDown?: () => void
}

export interface WorkspaceTabListItemProps {
  tab: WorkspaceSidebarItem
  active?: boolean
  onSelect?: (sessionId: string) => void
}

export interface WorkspaceSidebarItem {
  sessionId: string
  title: string
  subtitle?: string
  connectionId?: string
  isLocal?: boolean
  isPinned?: boolean
}

export interface WorkspaceSplitViewProps {
  panes: WorkspacePane[]
  renderPane: (pane: WorkspacePane) => ReactNode
}

export interface WorkspaceDropZoneProps {
  label?: string
  description?: string
  active?: boolean
}
