import { backendService } from './backend'
import { LogEntry } from '@/types/log'

export const logService = {
  list(): Promise<LogEntry[]> {
    return new Promise((resolve) => {
      const handler = (msg: any) => {
        backendService.off('log:list')
        resolve(msg.data)
      }
      backendService.on('log:list', handler)
      backendService.send({ type: 'log:list' })
    })
  },

  read(filename: string): Promise<string> {
    return new Promise((resolve) => {
      const handler = (msg: any) => {
        backendService.off('log:read')
        resolve(msg.data.content)
      }
      backendService.on('log:read', handler)
      backendService.send({
        type: 'log:read',
        data: { filename }
      })
    })
  },

  delete(filename: string): void {
    backendService.send({
      type: 'log:delete',
      data: { filename }
    })
  }
}
