import { Appearance } from 'react-native'
import { create } from 'zustand'

export type ThemeName = 'light' | 'dark'

type ThemeState = {
  theme: ThemeName
  systemTheme: ThemeName
  followSystem: boolean
  setTheme: (theme: ThemeName) => void
  toggleTheme: () => void
  setFollowSystem: (value: boolean) => void
  setSystemTheme: (theme: ThemeName) => void
}

const getSystemTheme = (): ThemeName => {
  const scheme = Appearance.getColorScheme()
  return scheme === 'dark' ? 'dark' : 'light'
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: getSystemTheme(),
  systemTheme: getSystemTheme(),
  followSystem: true,
  setTheme: (theme) => set({ theme, followSystem: false }),
  toggleTheme: () => {
    const current = get().theme
    set({ theme: current === 'light' ? 'dark' : 'light', followSystem: false })
  },
  setFollowSystem: (value) =>
    set((state) => ({
      followSystem: value,
      theme: value ? state.systemTheme : state.theme,
    })),
  setSystemTheme: (theme) =>
    set((state) => ({
      systemTheme: theme,
      theme: state.followSystem ? theme : state.theme,
    })),
}))
