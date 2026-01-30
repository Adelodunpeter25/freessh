import type { HistoryEntry } from '@renderer/types/history'

class HistoryService {
  async list(): Promise<HistoryEntry[]> {
    return window.electron.ipcRenderer.invoke('history:list')
  }

  async clear(): Promise<void> {
    return window.electron.ipcRenderer.invoke('history:clear')
  }
}

export const historyService = new HistoryService()
