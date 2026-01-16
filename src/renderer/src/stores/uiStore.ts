import { create } from 'zustand'

interface UIStore {
  sidebarOpen: boolean
  sftpConnectionId: string | null
  
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  openSFTP: (connectionId: string) => void
  clearSFTPConnection: () => void
}

export const useUIStore = create<UIStore>((set) => ({
  sidebarOpen: true,
  sftpConnectionId: null,

  toggleSidebar: () => {
    set((state) => ({ sidebarOpen: !state.sidebarOpen }))
  },

  setSidebarOpen: (open) => {
    set({ sidebarOpen: open })
  },

  openSFTP: (connectionId) => {
    set({ sftpConnectionId: connectionId })
  },

  clearSFTPConnection: () => {
    set({ sftpConnectionId: null })
  }
}))
