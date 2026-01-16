import { create } from 'zustand'

type Theme = 'light' | 'dark' | 'system'

interface ThemeStore {
  theme: Theme
  effectiveTheme: 'light' | 'dark'
  
  setTheme: (theme: Theme) => void
}

const getSystemTheme = (): 'light' | 'dark' => {
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark'
  }
  return 'light'
}

const getEffectiveTheme = (theme: Theme): 'light' | 'dark' => {
  return theme === 'system' ? getSystemTheme() : theme
}

export const useThemeStore = create<ThemeStore>((set, get) => {
  // Listen for system theme changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    const { theme } = get()
    if (theme === 'system') {
      const newEffectiveTheme = e.matches ? 'dark' : 'light'
      set({ effectiveTheme: newEffectiveTheme })
      document.documentElement.setAttribute('data-theme', newEffectiveTheme)
    }
  })

  return {
    theme: 'system',
    effectiveTheme: getSystemTheme(),

    setTheme: (theme) => {
      const effectiveTheme = getEffectiveTheme(theme)
      set({ theme, effectiveTheme })
      document.documentElement.setAttribute('data-theme', effectiveTheme)
    }
  }
})


