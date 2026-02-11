import { Pin, PinOff, X, Edit, FolderSync, CopyPlus } from 'lucide-react'
import { BaseContextMenu, ContextMenuAction } from './BaseContextMenu'

interface SessionTabContextMenuProps {
  children: React.ReactNode
  tabId: string
  tabTitle: string
  isPinned: boolean
  showSFTP?: boolean
  showDuplicate?: boolean
  onClose: () => void
  onRename: () => void
  onDuplicate: () => void
  onOpenSFTP: () => void
  onTogglePin: () => void
}

export function SessionTabContextMenu({
  children,
  tabId,
  tabTitle,
  isPinned,
  showSFTP = true,
  showDuplicate = true,
  onClose,
  onRename,
  onDuplicate,
  onOpenSFTP,
  onTogglePin
}: SessionTabContextMenuProps) {
  const actions: ContextMenuAction[] = [
    {
      label: 'Rename Tab',
      icon: <Edit className="w-4 h-4" />,
      onClick: onRename
    },
    ...(showDuplicate ? [{
      label: 'Duplicate Tab',
      icon: <CopyPlus className="w-4 h-4" />,
      onClick: onDuplicate
    }] : []),
    ...(showSFTP ? [{
      label: 'Open SFTP',
      icon: <FolderSync className="w-4 h-4" />,
      onClick: onOpenSFTP,
      separator: true
    }] : []),
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
