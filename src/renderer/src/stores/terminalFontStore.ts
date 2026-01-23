import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface TerminalFontState {
  fontFamily: string
  fontSize: number
  fontWeight: number
  setFontFamily: (family: string) => void
  setFontSize: (size: number) => void
  setFontWeight: (weight: number) => void
}

export const useTerminalFontStore = create<TerminalFontState>()(
  persist(
    (set) => ({
      fontFamily: '"JetBrains Mono", monospace',
      fontSize: 14,
      fontWeight: 400,
      setFontFamily: (family) => set({ fontFamily: family }),
      setFontSize: (size) => set({ fontSize: size }),
      setFontWeight: (weight) => set({ fontWeight: weight })
    }),
    {
      name: 'terminal-font-settings'
    }
  )
)
