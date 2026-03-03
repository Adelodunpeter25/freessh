import type { ShortcutDefinition, ShortcutMap } from './types'

export const DEFAULT_SHORTCUTS: ShortcutMap = {
  new_connection: 'cmd+t',
  new_local_terminal: 'cmd+l',
  open_command_palette: 'cmd+p',
  close_tab: 'cmd+w',
  open_settings: 'cmd+,',
  show_shortcuts: 'cmd+shift+/',
  toggle_terminal_sidebar: 'cmd+s',
  clear_terminal: 'cmd+k',
  search_terminal: 'cmd+f',
  refresh_sftp: 'cmd+r',
  delete_file: 'delete',
}

export const SHORTCUT_DEFINITIONS: ShortcutDefinition[] = [
  { action: 'new_connection', category: 'Navigation', description: 'New connection' },
  { action: 'new_local_terminal', category: 'Navigation', description: 'New local terminal' },
  { action: 'open_command_palette', category: 'Navigation', description: 'Open command palette' },
  { action: 'close_tab', category: 'Navigation', description: 'Close current tab' },
  { action: 'open_settings', category: 'Navigation', description: 'Open settings' },
  { action: 'show_shortcuts', category: 'Navigation', description: 'Show keyboard shortcuts' },
  { action: 'toggle_terminal_sidebar', category: 'Navigation', description: 'Toggle terminal sidebar' },
  { action: 'clear_terminal', category: 'Terminal', description: 'Clear terminal' },
  { action: 'search_terminal', category: 'Terminal', description: 'Search in terminal' },
  { action: 'refresh_sftp', category: 'SFTP', description: 'Refresh file lists' },
  { action: 'delete_file', category: 'SFTP', description: 'Delete selected file' },
]

export const SHORTCUT_STORAGE_KEY = 'freessh.shortcuts.v1'
