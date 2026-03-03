import { useCallback, useEffect, useMemo, useState } from 'react'
import { DEFAULT_SHORTCUTS, SHORTCUT_STORAGE_KEY } from './defaults'
import type { ShortcutAction, ShortcutMap } from '@/types/keyboardshortcuts'
import { formatShortcutForStorage } from './utils'

const RESERVED_SHORTCUTS = new Set([
  'cmd+1',
  'cmd+2',
  'cmd+3',
  'cmd+4',
  'cmd+5',
  'cmd+6',
  'cmd+7',
  'cmd+8',
  'cmd+9',
])

const loadShortcuts = (): ShortcutMap => {
  try {
    const raw = localStorage.getItem(SHORTCUT_STORAGE_KEY)
    if (!raw) return { ...DEFAULT_SHORTCUTS }

    const parsed = JSON.parse(raw) as Partial<ShortcutMap>
    return {
      ...DEFAULT_SHORTCUTS,
      ...Object.fromEntries(
        Object.entries(parsed).map(([action, shortcut]) => [
          action,
          typeof shortcut === 'string' ? formatShortcutForStorage(shortcut) : DEFAULT_SHORTCUTS[action as ShortcutAction],
        ]),
      ),
    }
  } catch {
    return { ...DEFAULT_SHORTCUTS }
  }
}

const persistShortcuts = (shortcuts: ShortcutMap): void => {
  localStorage.setItem(SHORTCUT_STORAGE_KEY, JSON.stringify(shortcuts))
  window.dispatchEvent(new Event('freessh:shortcuts:updated'))
}

export function useShortcutSettings() {
  const [shortcuts, setShortcuts] = useState<ShortcutMap>(() => loadShortcuts())

  useEffect(() => {
    const sync = () => setShortcuts(loadShortcuts())
    window.addEventListener('storage', sync)
    window.addEventListener('freessh:shortcuts:updated', sync)
    return () => {
      window.removeEventListener('storage', sync)
      window.removeEventListener('freessh:shortcuts:updated', sync)
    }
  }, [])

  const setShortcut = useCallback((action: ShortcutAction, shortcut: string) => {
    const normalized = formatShortcutForStorage(shortcut)
    if (!normalized) {
      throw new Error('Shortcut cannot be empty')
    }
    if (RESERVED_SHORTCUTS.has(normalized)) {
      throw new Error('Shortcut is reserved for tab navigation')
    }

    const conflict = Object.entries(shortcuts).find(
      ([existingAction, existingShortcut]) =>
        existingAction !== action && existingShortcut === normalized,
    )

    if (conflict) {
      throw new Error('Shortcut is already in use')
    }

    const next = { ...shortcuts, [action]: normalized }
    setShortcuts(next)
    persistShortcuts(next)
  }, [shortcuts])

  const resetShortcut = useCallback((action: ShortcutAction) => {
    const next = { ...shortcuts, [action]: DEFAULT_SHORTCUTS[action] }
    setShortcuts(next)
    persistShortcuts(next)
  }, [shortcuts])

  const resetAllShortcuts = useCallback(() => {
    const next = { ...DEFAULT_SHORTCUTS }
    setShortcuts(next)
    persistShortcuts(next)
  }, [])

  const actionByShortcut = useMemo(() => {
    const map = new Map<string, ShortcutAction>()
    for (const [action, shortcut] of Object.entries(shortcuts) as [ShortcutAction, string][]) {
      map.set(shortcut, action)
    }
    return map
  }, [shortcuts])

  return {
    shortcuts,
    actionByShortcut,
    setShortcut,
    resetShortcut,
    resetAllShortcuts,
  }
}
