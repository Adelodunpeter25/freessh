import { backendService } from '../ipc/backend'
import { SSHKey } from '../../types/key'

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

  async save(key: Omit<SSHKey, 'id' | 'createdAt'>, privateKey: string): Promise<SSHKey> {
    console.log('[keyStorageService] save called with:', { key, privateKeyLength: privateKey.length })
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        backendService.off('key:save', handler)
        backendService.off('error', errorHandler)
        console.error('[keyStorageService] Timeout - no response from backend after 10s')
        reject(new Error('Request timeout - no response from backend'))
      }, 10000)

      const handler = (message: any) => {
        clearTimeout(timeout)
        backendService.off('key:save', handler)
        backendService.off('error', errorHandler)
        console.log('[keyStorageService] Received response:', message)
        if (message.type === 'error') {
          console.error('[keyStorageService] Error response:', message.data)
          reject(new Error(message.data))
        } else {
          console.log('[keyStorageService] Success response:', message.data)
          resolve(message.data as SSHKey)
        }
      }

      const errorHandler = (error: any) => {
        clearTimeout(timeout)
        backendService.off('key:save', handler)
        backendService.off('error', errorHandler)
        console.error('[keyStorageService] Error event:', error)
        reject(error)
      }

      backendService.on('key:save', handler)
      backendService.on('error', errorHandler)
      const payload = { key, privateKey }
      console.log('[keyStorageService] Sending to backend:', payload)
      backendService.send({
        type: 'key:save',
        data: payload
      })
    })
  },

  async update(key: SSHKey): Promise<SSHKey> {
    return new Promise((resolve, reject) => {
      const handler = (message: any) => {
        backendService.off('key:update', handler)
        if (message.type === 'error') {
          reject(new Error(message.data))
        } else {
          resolve(message.data as SSHKey)
        }
      }
      backendService.on('key:update', handler)
      backendService.send({
        type: 'key:update',
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
  },

  async exportToHost(keyId: string, connectionId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const handler = (message: any) => {
        backendService.off('key:export', handler)
        if (message.type === 'error') {
          reject(new Error(message.data))
        } else {
          resolve()
        }
      }
      backendService.on('key:export', handler)
      backendService.send({
        type: 'key:export',
        data: { key_id: keyId, connection_id: connectionId }
      })
    })
  }
}
