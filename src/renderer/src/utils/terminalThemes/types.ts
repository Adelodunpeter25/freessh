import { ITheme } from 'xterm'

export interface TerminalThemePreset {
  name: string
  theme: ITheme
  isLight: boolean
}
