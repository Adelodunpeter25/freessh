import { SessionTabContextMenu } from '@/components/contextmenu/SessionTabContextMenu'

interface SessionTabMenuProps {
  tabId: string
  tabTitle: string
  isPinned: boolean
  showSFTP: boolean
  sessionId: string
  children: React.ReactNode
  onClose: () => void
  onRename: () => void
  onOpenSFTP: () => void
  onTogglePin: () => void
}

export function SessionTabMenu({
  tabId,
  tabTitle,
  isPinned,
  showSFTP,
  sessionId,
  children,
  onClose,
  onRename,
  onOpenSFTP,
  onTogglePin
}: SessionTabMenuProps) {
  return (
    <SessionTabContextMenu
      tabId={tabId}
      tabTitle={tabTitle}
      isPinned={isPinned}
      showSFTP={showSFTP}
      onClose={onClose}
      onRename={onRename}
      onOpenSFTP={onOpenSFTP}
      onTogglePin={onTogglePin}
    >
      {children}
    </SessionTabContextMenu>
  )
}
