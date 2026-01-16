import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { ITheme } from 'xterm'
import { terminalThemePresets } from '@/utils/terminalThemePresets'

interface TerminalThemeStore {
  themeName: string
  setTheme: (name: string) => void
  getTheme: () => ITheme
}

export const useTerminalThemeStore = create<TerminalThemeStore>()(
  persist(
    (set, get) => ({
      themeName: 'Default Dark',
      setTheme: (name) => set({ themeName: name }),
      getTheme: () => {
        const preset = terminalThemePresets.find(p => p.name === get().themeName)
        return preset?.theme || terminalThemePresets[0].theme
      }
    }),
    { name: 'terminal-theme' }
  )
)

