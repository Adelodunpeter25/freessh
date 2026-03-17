import { create } from 'zustand'

export type SnackbarVariant = 'success' | 'error' | 'info' | 'warning'

type SnackbarState = {
  open: boolean
  message: string
  variant: SnackbarVariant
  show: (message: string, variant?: SnackbarVariant, durationMs?: number) => void
  hide: () => void
}

let hideTimer: ReturnType<typeof setTimeout> | null = null

export const useSnackbarStore = create<SnackbarState>((set) => ({
  open: false,
  message: '',
  variant: 'info',

  show: (message, variant = 'info', durationMs = 400) => {
    if (hideTimer) {
      clearTimeout(hideTimer)
      hideTimer = null
    }
    set({ open: true, message, variant })
    hideTimer = setTimeout(() => {
      set({ open: false })
      hideTimer = null
    }, durationMs)
  },

  hide: () => {
    if (hideTimer) {
      clearTimeout(hideTimer)
      hideTimer = null
    }
    set({ open: false })
  },
}))
