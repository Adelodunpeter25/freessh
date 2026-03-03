const isMac = navigator.platform.toUpperCase().includes('MAC')

const normalizeKey = (key: string): string => key.toLowerCase()

export const formatShortcutForStorage = (shortcut: string): string => {
  return shortcut
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace('ctrl', 'cmd')
    .replace('meta', 'cmd')
}

const getModifierKey = (e: KeyboardEvent): string => {
  const modifiers: string[] = []

  if (e.ctrlKey || (isMac && e.metaKey)) modifiers.push('cmd')
  if (e.shiftKey) modifiers.push('shift')
  if (e.altKey) modifiers.push('alt')

  return modifiers.join('+')
}

export const buildShortcutKeyFromEvent = (e: KeyboardEvent): string => {
  const modifier = getModifierKey(e)
  let key = normalizeKey(e.key)
  if (key === '?') key = '/'

  return modifier ? `${modifier}+${key}` : key
}

export const displayShortcut = (shortcut: string): string => {
  const parts = formatShortcutForStorage(shortcut).split('+')

  return parts
    .map((part) => {
      if (part === 'cmd') return isMac ? '⌘' : 'Ctrl'
      if (part === 'shift') return 'Shift'
      if (part === 'alt') return isMac ? '⌥' : 'Alt'
      if (part === ',') return ','
      if (part === '/') return '/'
      return part.length === 1 ? part.toUpperCase() : part
    })
    .join('+')
}

export const isEditableTarget = (target: EventTarget | null): boolean => {
  const el = target as HTMLElement | null
  return (
    el instanceof HTMLInputElement ||
    el instanceof HTMLTextAreaElement ||
    !!el?.isContentEditable
  )
}
