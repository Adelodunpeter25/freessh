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
      icon: <Edit className="w-4 h-4" />,
      onClick: onRename
    },
    {
      label: 'Open SFTP',
      icon: <FolderSync className="w-4 h-4" />,
      onClick: onOpenSFTP,
      separator: true
    },
    {
      label: isPinned ? 'Unpin Tab' : 'Pin Tab',
      icon: isPinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />,
      onClick: onTogglePin,
      separator: true
    },
    {
      label: 'Close Tab',
      icon: <X className="w-4 h-4" />,
      onClick: onClose,
      destructive: true
    }
  ]

  return <BaseContextMenu actions={actions}>{children}</BaseContextMenu>
}
