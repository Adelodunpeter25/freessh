import { useEffect } from 'react'
import { useTabStore } from '@/stores/tabStore'

const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0

const normalizeKey = (key: string): string => {
  return key.toLowerCase()
}

const getModifierKey = (e: KeyboardEvent): string => {
  const modifiers: string[] = []
  
  if (e.ctrlKey || (isMac && e.metaKey)) modifiers.push('cmd')
  if (e.shiftKey) modifiers.push('shift')
  if (e.altKey) modifiers.push('alt')
  
  return modifiers.join('+')
}

const buildShortcutKey = (e: KeyboardEvent): string => {
  const modifier = getModifierKey(e)
  const key = normalizeKey(e.key)
  
  if (modifier) {
    return `${modifier}+${key}`
  }
  
  return key
}

interface ShortcutHandlers {
  onSwitchTab?: (index: number) => void
  onNewConnection?: () => void
  onNewLocalTerminal?: () => void
  onOpenSettings?: () => void
  onClearTerminal?: () => void
  onSearchTerminal?: () => void
  onRefreshSFTP?: () => void
  onDeleteFile?: () => void
  onShowShortcuts?: () => void
}

export function useKeyboardShortcuts(handlers: ShortcutHandlers, enabled = true) {
  const tabs = useTabStore((state) => state.tabs)
  const setActiveTab = useTabStore((state) => state.setActiveTab)
  const removeTab = useTabStore((state) => state.removeTab)
  const activeTabId = useTabStore((state) => state.activeTabId)

  useEffect(() => {
    if (!enabled) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // If default is already prevented, don't interfere
      if (e.defaultPrevented) return
      
      const target = e.target as HTMLElement
      const isInputField = target instanceof HTMLInputElement || 
                          target instanceof HTMLTextAreaElement ||
                          target.isContentEditable
      
      const shortcutKey = buildShortcutKey(e)
      
      // Navigation shortcuts
      if (shortcutKey.match(/^cmd\+[1-9]$/)) {
        e.preventDefault()
        
        // Index 0 = Home, Index 1 = SFTP, Index 2+ = Session tabs
        const index = parseInt(shortcutKey.slice(-1)) - 1
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

      // Only handle our custom shortcuts, ignore everything else
      switch (shortcutKey) {
        case 'cmd+t':
          e.preventDefault()
          handlers.onNewConnection?.()
          break
        
        case 'cmd+l':
          e.preventDefault()
          handlers.onNewLocalTerminal?.()
          break
        
        case 'cmd+w':
          e.preventDefault()
          if (activeTabId) {
            removeTab(activeTabId)
          }
          break
        
        case 'cmd+,':
          e.preventDefault()
          handlers.onOpenSettings?.()
          break
        
        case 'cmd+?':
        case 'cmd+shift+/':
          e.preventDefault()
          handlers.onShowShortcuts?.()
          break
        
        case 'cmd+k':
          e.preventDefault()
          handlers.onClearTerminal?.()
          break
        
        case 'cmd+f':
          e.preventDefault()
          handlers.onSearchTerminal?.()
          break
        
        case 'cmd+r':
          e.preventDefault()
          handlers.onRefreshSFTP?.()
          break
        
        case 'delete':
          if (!isInputField) {
            e.preventDefault()
            handlers.onDeleteFile?.()
          }
          break
        
        // All other shortcuts (Cmd+A, Cmd+C, etc.) fall through and work normally
      }
    }

    // Use capture phase to check early, but only preventDefault for our shortcuts
    window.addEventListener('keydown', handleKeyDown, false)
    return () => window.removeEventListener('keydown', handleKeyDown, false)
  }, [handlers, enabled, tabs, setActiveTab, removeTab, activeTabId])
}
