import { Pin, PinOff, X, Edit, FolderSync } from 'lucide-react'
import { BaseContextMenu, ContextMenuAction } from './BaseContextMenu'

interface SessionTabContextMenuProps {
  children: React.ReactNode
  tabId: string
  tabTitle: string
  isPinned: boolean
  onClose: () => void
  onRename: () => void
  onOpenSFTP: () => void
  onTogglePin: () => void
}

export function SessionTabContextMenu({
  children,
  tabId,
  tabTitle,
  isPinned,
  onClose,
  onRename,
  onOpenSFTP,
  onTogglePin
}: SessionTabContextMenuProps) {
  const actions: ContextMenuAction[] = [
    {
      label: 'Rename Tab',
      icon: Edit,
      onClick: onRename
    },
    {
      label: 'Open SFTP',
      icon: FolderSync,
      onClick: onOpenSFTP
    },
    {
      type: 'separator'
    },
    {
      label: isPinned ? 'Unpin Tab' : 'Pin Tab',
      icon: isPinned ? PinOff : Pin,
      onClick: onTogglePin
    },
    {
      type: 'separator'
    },
    {
      label: 'Close Tab',
      icon: X,
      onClick: onClose,
      variant: 'destructive'
    }
  ]

  return <BaseContextMenu actions={actions}>{children}</BaseContextMenu>
}
