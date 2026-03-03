import { useEffect } from 'react'
import { useTabStore } from '@/stores/tabStore'
import { useShortcutSettings } from '@/hooks/keyboardshortcuts'
import { buildShortcutKeyFromEvent, isEditableTarget } from '@/hooks/keyboardshortcuts'
import type { ShortcutAction } from '@/types/keyboardshortcuts'

interface ShortcutHandlers {
  onSwitchTab?: (index: number) => void
  onNewConnection?: () => void
  onNewLocalTerminal?: () => void
  onOpenCommandPalette?: () => void
  onCloseTab?: () => void
  onOpenSettings?: () => void
  onClearTerminal?: () => void
  onSearchTerminal?: () => void
  onRefreshSFTP?: () => void
  onDeleteFile?: () => void
  onShowShortcuts?: () => void
  onToggleTerminalSidebar?: () => void
}

export function useKeyboardShortcuts(handlers: ShortcutHandlers, enabled = true) {
  const tabs = useTabStore((state) => state.tabs)
  const setActiveTab = useTabStore((state) => state.setActiveTab)
  const { actionByShortcut } = useShortcutSettings()

  useEffect(() => {
    if (!enabled) return

    const handleKeyDown = (e: KeyboardEvent) => {
      const shortcutKey = buildShortcutKeyFromEvent(e)
      const isEditable = isEditableTarget(e.target)
      
      // Navigation shortcuts
      if (shortcutKey.match(/^cmd\+[1-9]$/)) {
        const index = parseInt(shortcutKey.slice(-1)) - 1
        e.preventDefault()
        
        // Index 0 = Home, Index 1 = SFTP, Index 2+ = Session tabs
        if (index === 0) {
          handlers.onSwitchTab?.(0) // Home
        } else if (index === 1) {
          handlers.onSwitchTab?.(1) // SFTP
        } else {
          const sessionIndex = index - 2
          if (tabs[sessionIndex]) {
            setActiveTab(tabs[sessionIndex].id)
            handlers.onSwitchTab?.(index)
          }
        }
        return
      }

      const action = actionByShortcut.get(shortcutKey)

      switch (action as ShortcutAction | undefined) {
        case 'new_connection':
          e.preventDefault()
          handlers.onNewConnection?.()
          break
        
        case 'new_local_terminal':
          e.preventDefault()
          handlers.onNewLocalTerminal?.()
          break

        case 'open_command_palette':
          e.preventDefault()
          handlers.onOpenCommandPalette?.()
          break
        
        case 'close_tab':
          e.preventDefault()
          handlers.onCloseTab?.()
          break
        
        case 'open_settings':
          e.preventDefault()
          handlers.onOpenSettings?.()
          break
        
        case 'show_shortcuts':
          e.preventDefault()
          handlers.onShowShortcuts?.()
          break

        case 'toggle_terminal_sidebar':
          e.preventDefault()
          handlers.onToggleTerminalSidebar?.()
          break
        
        case 'clear_terminal':
          e.preventDefault()
          handlers.onClearTerminal?.()
          break
        
        case 'search_terminal':
          e.preventDefault()
          handlers.onSearchTerminal?.()
          break
        
        case 'refresh_sftp':
          e.preventDefault()
          handlers.onRefreshSFTP?.()
          break
        
        case 'delete_file':
          // Only if not in input field
          if (!isEditable) {
            e.preventDefault()
            handlers.onDeleteFile?.()
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handlers, enabled, tabs, setActiveTab, actionByShortcut])
}
