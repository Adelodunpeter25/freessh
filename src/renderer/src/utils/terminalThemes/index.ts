import { darkThemes } from './dark'
import { lightThemes } from './light'

export type { TerminalThemePreset } from './types'
export { darkThemes } from './dark'
export { lightThemes } from './light'

export const terminalThemePresets = [...darkThemes, ...lightThemes]
