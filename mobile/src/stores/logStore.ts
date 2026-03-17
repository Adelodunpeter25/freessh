import { create } from 'zustand'
import type { LogEntry } from '@/types'
import { logService } from '../services/crud'

type LogState = {
  logs: LogEntry[]
  loading: boolean
  initialize: () => Promise<void>
  addLog: (log: LogEntry) => Promise<void>
  removeLog: (filename: string) => Promise<void>
  clearLogs: () => Promise<void>
}

export const useLogStore = create<LogState>((set) => ({
  logs: [],
  loading: false,

  initialize: async () => {
    set({ loading: true })
    try {
      const logs = await logService.getAll()
      set({ logs, loading: false })
    } catch (error) {
      console.error('Failed to load logs:', error)
      set({ loading: false })
    }
  },

  addLog: async (log) => {
    await logService.addEntry(log)
    set((state) => ({ logs: [log, ...state.logs] }))
  },

  removeLog: async (filename) => {
    await logService.delete(filename)
    set((state) => ({
      logs: state.logs.filter((item) => item.filename !== filename),
    }))
  },

  clearLogs: async () => {
    await logService.clear()
    set({ logs: [] })
  },
}))
