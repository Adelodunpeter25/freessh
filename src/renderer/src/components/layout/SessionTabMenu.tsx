import { SessionTabContextMenu } from '@/components/contextmenu/SessionTabContextMenu'

interface SessionTabMenuProps {
  tabId: string
  tabTitle: string
  isPinned: boolean
  showSFTP: boolean
  showDuplicate: boolean
  sessionId: string
  children: React.ReactNode
  onClose: () => void
  onRename: () => void
  onDuplicate: () => void
  onOpenSFTP: () => void
  onTogglePin: () => void
}

export function SessionTabMenu({
  tabId,
  tabTitle,
  isPinned,
  showSFTP,
  showDuplicate,
  sessionId,
  children,
  onClose,
  onRename,
  onDuplicate,
  onOpenSFTP,
  onTogglePin
}: SessionTabMenuProps) {
  return (
    <SessionTabContextMenu
      tabId={tabId}
      tabTitle={tabTitle}
      isPinned={isPinned}
      showSFTP={showSFTP}
      showDuplicate={showDuplicate}
      onClose={onClose}
      onRename={onRename}
      onDuplicate={onDuplicate}
      onOpenSFTP={onOpenSFTP}
      onTogglePin={onTogglePin}
    >
      {children}
    </SessionTabContextMenu>
  )
}
