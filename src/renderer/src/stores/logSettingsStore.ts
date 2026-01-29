import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type AutoLogging = 'enabled' | 'disabled'

interface LogSettingsStore {
  autoLogging: AutoLogging
  setAutoLogging: (value: AutoLogging) => void
}

export const useLogSettingsStore = create<LogSettingsStore>()(
  persist(
    (set) => ({
      autoLogging: 'disabled',
      setAutoLogging: (value) => set({ autoLogging: value })
    }),
    {
      name: 'log-settings'
    }
  )
)
