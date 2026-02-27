import { backendService } from './backend'
import type { HistoryEntry } from '@renderer/types/history'

export const historyService = {
  async list(): Promise<HistoryEntry[]> {
    const data = await backendService.request<{ entries?: HistoryEntry[] }>(
      {
        type: 'history:list',
        data: {}
      },
      'history:list',
      10000,
    )

    return data.entries || []
  },

  async clear(): Promise<void> {
    await backendService.request<void>(
      {
        type: 'history:clear',
        data: {}
      },
      'history:clear',
      10000,
    )
  }
}
