import { create } from 'zustand'

type UIState = {
  searchQuery: string
  setSearchQuery: (value: string) => void
  snackbarMessage: string | null
  setSnackbarMessage: (message: string | null) => void
}

export const useUIStore = create<UIState>((set) => ({
  searchQuery: '',
  setSearchQuery: (value) => set({ searchQuery: value }),
  snackbarMessage: null,
  setSnackbarMessage: (message) => set({ snackbarMessage: message }),
}))
