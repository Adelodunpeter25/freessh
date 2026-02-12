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
  sidebar: ReactNode
  content: ReactNode
  footer?: ReactNode
}

export interface WorkspaceSidebarProps {
  tabs: WorkspaceTabModel[]
  activeTabId: string | null
  onSelectTab?: (tabId: string) => void
}

export interface WorkspaceTabListItemProps {
  tab: WorkspaceTabModel
  active?: boolean
  onSelect?: (tabId: string) => void
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
