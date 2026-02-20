import { ArrowDown, ArrowRight, FolderSync, Pin, PinOff, PlugZap } from 'lucide-react'
import { BaseContextMenu, ContextMenuAction } from './BaseContextMenu'

interface WorkspaceContextMenuProps {
  children: React.ReactNode
  isPinned: boolean
  isRemote: boolean
  onDisconnectSession: () => void
  onOpenSFTP: () => void
  onTogglePin: () => void
  onSplitRight: () => void
  onSplitDown: () => void
}

export function WorkspaceContextMenu({
  children,
  isPinned,
  isRemote,
  onDisconnectSession,
  onOpenSFTP,
  onTogglePin,
  onSplitRight,
  onSplitDown,
}: WorkspaceContextMenuProps) {
  const actions: ContextMenuAction[] = [
    ...(isRemote
      ? [
          {
            label: 'Open in SFTP',
            icon: <FolderSync className="w-4 h-4" />,
            onClick: onOpenSFTP,
          } as ContextMenuAction,
        ]
      : []),
    {
      label: isPinned ? 'Unpin in Workspace' : 'Pin in Workspace',
      icon: isPinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />,
      onClick: onTogglePin,
      separator: true,
    },
    {
      label: 'Split Right',
      icon: <ArrowRight className="w-4 h-4" />,
      onClick: onSplitRight,
      separator: true,
    },
    {
      label: 'Split Down',
      icon: <ArrowDown className="w-4 h-4" />,
      onClick: onSplitDown,
    },
    {
      label: 'Disconnect Session',
      icon: <PlugZap className="w-4 h-4" />,
      onClick: onDisconnectSession,
      destructive: true,
      separator: true,
    },
  ]

  return <BaseContextMenu actions={actions}>{children}</BaseContextMenu>
}
