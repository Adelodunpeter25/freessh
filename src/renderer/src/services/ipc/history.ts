import { backendService } from './backend'
import { IPCMessage } from '@/types'
import type { HistoryEntry } from '@renderer/types/history'

export const historyService = {
  async list(): Promise<HistoryEntry[]> {
    return new Promise((resolve, reject) => {
      const handler = (message: IPCMessage) => {
        if (message.type === 'history:list') {
          backendService.off('history:list')
          backendService.off('error')
          resolve(message.data.entries || [])
        } else if (message.type === 'error') {
          backendService.off('history:list')
          backendService.off('error')
          reject(new Error(message.data.error))
        }
      }

      backendService.on('history:list', handler)
      backendService.on('error', handler)

      backendService.send({
        type: 'history:list',
        data: {}
      })
    })
  },

  async clear(): Promise<void> {
    return new Promise((resolve, reject) => {
      const handler = (message: IPCMessage) => {
        if (message.type === 'history:clear') {
          backendService.off('history:clear')
          backendService.off('error')
          resolve()
        } else if (message.type === 'error') {
          backendService.off('history:clear')
          backendService.off('error')
          reject(new Error(message.data.error))
        }
      }

      backendService.on('history:clear', handler)
      backendService.on('error', handler)

      backendService.send({
        type: 'history:clear',
        data: {}
      })
    })
  }
}
