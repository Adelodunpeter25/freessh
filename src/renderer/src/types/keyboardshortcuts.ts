export type ShortcutAction =
  | 'new_connection'
  | 'new_local_terminal'
  | 'open_command_palette'
  | 'close_tab'
  | 'open_settings'
  | 'show_shortcuts'
  | 'toggle_terminal_sidebar'
  | 'clear_terminal'
  | 'search_terminal'
  | 'refresh_sftp'
  | 'delete_file'

export type ShortcutCategory = 'Navigation' | 'Terminal' | 'SFTP'

export interface ShortcutDefinition {
  action: ShortcutAction
  category: ShortcutCategory
  description: string
}

export type ShortcutMap = Record<ShortcutAction, string>
