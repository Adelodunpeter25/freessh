import { useEffect } from 'react'

export interface KeyboardShortcuts {
  // Navigation
  'cmd+1'?: () => void
  'cmd+2'?: () => void
  'cmd+3'?: () => void
  'cmd+4'?: () => void
  'cmd+5'?: () => void
  'cmd+6'?: () => void
  'cmd+7'?: () => void
  'cmd+8'?: () => void
  'cmd+9'?: () => void
  'cmd+t'?: () => void
  'cmd+w'?: () => void
  'cmd+,'?: () => void
  
  // Terminal
  'cmd+l'?: () => void
  'cmd+f'?: () => void
  'cmd+c'?: () => void
  'cmd+v'?: () => void
  
  // SFTP
  'cmd+r'?: () => void
  'delete'?: () => void
  'backspace'?: () => void
  'enter'?: () => void
}

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

export function useKeyboardShortcuts(shortcuts: KeyboardShortcuts, enabled = true) {
  useEffect(() => {
    if (!enabled) return

    const handleKeyDown = (e: KeyboardEvent) => {
      const shortcutKey = buildShortcutKey(e)
      const handler = shortcuts[shortcutKey as keyof KeyboardShortcuts]
      
      if (handler) {
        e.preventDefault()
        handler()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [shortcuts, enabled])
}
