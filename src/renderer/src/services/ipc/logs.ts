import { backendService } from './backend'
import { LogEntry } from '@/types/log'

export const logService = {
  async list(): Promise<LogEntry[]> {
    return backendService.request<LogEntry[]>(
      { type: 'log:list' },
      'log:list',
      10000,
    )
  },

  async read(filename: string): Promise<string> {
    const data = await backendService.request<{ content: string }>(
      {
        type: 'log:read',
        data: { filename }
      },
      'log:read',
      10000,
    )
    return data.content
  },

  delete(filename: string): void {
    backendService.send({
      type: 'log:delete',
      data: { filename }
    })
  },

  async deleteAll(): Promise<void> {
    await backendService.request<void>(
      { type: 'log:delete_all' },
      'log:delete_all',
      10000,
    )
  }
}
