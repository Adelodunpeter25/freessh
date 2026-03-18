import { darkThemes } from './dark'
import { lightThemes } from './light'

export type { TerminalTheme, TerminalThemePreset } from './types'
export { darkThemes } from './dark'
export { lightThemes } from './light'

export const terminalThemePresets = [...darkThemes, ...lightThemes]

export const getThemeByName = (name: string) => {
  return terminalThemePresets.find(theme => theme.name === name)
}

export const getDefaultTheme = (isLight: boolean) => {
  return isLight 
    ? lightThemes.find(theme => theme.name === 'GitHub Light') || lightThemes[0]
    : darkThemes.find(theme => theme.name === 'Default Dark') || darkThemes[0]
}
