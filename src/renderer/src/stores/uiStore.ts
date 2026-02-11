import { create } from 'zustand'

interface UIStore {
  sidebarOpen: boolean
  sftpConnectionId: string | null
  sftpOpenRequest: number
  
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  openSFTP: (connectionId: string) => void
  clearSFTPConnection: () => void
}

export const useUIStore = create<UIStore>((set) => ({
  sidebarOpen: true,
  sftpConnectionId: null,
  sftpOpenRequest: 0,

  toggleSidebar: () => {
    set((state) => ({ sidebarOpen: !state.sidebarOpen }))
  },

  setSidebarOpen: (open) => {
    set({ sidebarOpen: open })
  },

  openSFTP: (connectionId) => {
    set((state) => ({
      sftpConnectionId: connectionId,
      sftpOpenRequest: state.sftpOpenRequest + 1
    }))
  },

  clearSFTPConnection: () => {
    set({ sftpConnectionId: null })
  }
}))
