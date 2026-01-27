import { backendService } from './ipc/backend'
import { SSHKey } from '../types/key'

export const keyStorageService = {
  async list(): Promise<SSHKey[]> {
    return new Promise((resolve, reject) => {
      const handler = (message: any) => {
        backendService.off('key:list', handler)
        if (message.type === 'error') {
          reject(new Error(message.data))
        } else {
          resolve(message.data as SSHKey[])
        }
      }
      backendService.on('key:list', handler)
      backendService.send({ type: 'key:list' })
    })
  },

  async save(key: Omit<SSHKey, 'id' | 'createdAt'>): Promise<SSHKey> {
    return new Promise((resolve, reject) => {
      const handler = (message: any) => {
        backendService.off('key:save', handler)
        if (message.type === 'error') {
          reject(new Error(message.data))
        } else {
          resolve(message.data as SSHKey)
        }
      }
      backendService.on('key:save', handler)
      backendService.send({
        type: 'key:save',
        data: key
      })
    })
  },

  async delete(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const handler = (message: any) => {
        backendService.off('key:delete', handler)
        if (message.type === 'error') {
          reject(new Error(message.data))
        } else {
          resolve()
        }
      }
      backendService.on('key:delete', handler)
      backendService.send({
        type: 'key:delete',
        data: { id }
      })
    })
  }
}
