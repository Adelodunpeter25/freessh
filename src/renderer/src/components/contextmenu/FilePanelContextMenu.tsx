import { FolderPlus, RefreshCw } from 'lucide-react'
import { BaseContextMenu, ContextMenuAction } from './BaseContextMenu'

interface FilePanelContextMenuProps {
  children: React.ReactNode
  onNewFolder: () => void
  onRefresh: () => void
}

export function FilePanelContextMenu({
  children,
  onNewFolder,
  onRefresh,
}: FilePanelContextMenuProps) {
  const actions: ContextMenuAction[] = [
    { label: 'New Folder', icon: <FolderPlus className="w-4 h-4" />, onClick: onNewFolder },
    { label: 'Refresh', icon: <RefreshCw className="w-4 h-4" />, onClick: onRefresh },
  ]

  return <BaseContextMenu actions={actions}>{children}</BaseContextMenu>
}
