import { useEffect } from 'react'
import { useTabStore } from '@/stores/tabStore'

const isMac = process.platform === 'darwin'

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
  onOpenSettings?: () => void
  onClearTerminal?: () => void
  onSearchTerminal?: () => void
  onRefreshSFTP?: () => void
  onDeleteFile?: () => void
}

export function useKeyboardShortcuts(handlers: ShortcutHandlers, enabled = true) {
  const tabs = useTabStore((state) => state.tabs)
  const setActiveTab = useTabStore((state) => state.setActiveTab)
  const closeTab = useTabStore((state) => state.closeTab)
  const activeTabId = useTabStore((state) => state.activeTabId)

  useEffect(() => {
    if (!enabled) return

    const handleKeyDown = (e: KeyboardEvent) => {
      const shortcutKey = buildShortcutKey(e)
      
      // Navigation shortcuts
      if (shortcutKey.match(/^cmd\+[1-9]$/)) {
        const index = parseInt(shortcutKey.slice(-1)) - 1
        if (tabs[index]) {
          e.preventDefault()
          setActiveTab(tabs[index].id)
          handlers.onSwitchTab?.(index)
        }
        return
      }

      switch (shortcutKey) {
        // Navigation
        case 'cmd+t':
          e.preventDefault()
          handlers.onNewConnection?.()
          break
        
        case 'cmd+w':
          e.preventDefault()
          if (activeTabId) {
            closeTab(activeTabId)
          }
          break
        
        case 'cmd+,':
          e.preventDefault()
          handlers.onOpenSettings?.()
          break
        
        // Terminal
        case 'cmd+l':
          e.preventDefault()
          handlers.onClearTerminal?.()
          break
        
        case 'cmd+f':
          e.preventDefault()
          handlers.onSearchTerminal?.()
          break
        
        // SFTP
        case 'cmd+r':
          e.preventDefault()
          handlers.onRefreshSFTP?.()
          break
        
        case 'delete':
          // Only if not in input field
          if (!(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
            e.preventDefault()
            handlers.onDeleteFile?.()
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handlers, enabled, tabs, setActiveTab, closeTab, activeTabId])
}
