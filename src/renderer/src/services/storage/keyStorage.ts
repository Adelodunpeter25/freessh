import { backendService } from '../ipc/backend'
import { SSHKey } from '../../types/key'

function toError(value: unknown, fallback: string): Error {
  if (value instanceof Error) {
    return value
  }

  if (typeof value === 'string' && value.trim().length > 0) {
    return new Error(value)
  }

  if (value && typeof value === 'object') {
    const maybeError = value as { error?: unknown; data?: { error?: unknown } }
    if (typeof maybeError.error === 'string' && maybeError.error.trim().length > 0) {
      return new Error(maybeError.error)
    }
    if (
      maybeError.data &&
      typeof maybeError.data.error === 'string' &&
      maybeError.data.error.trim().length > 0
    ) {
      return new Error(maybeError.data.error)
    }
  }

  return new Error(fallback)
}

export const keyStorageService = {
  async list(): Promise<SSHKey[]> {
    return new Promise((resolve, reject) => {
      const handler = (message: any) => {
        backendService.off('key:list', handler)
        if (message.type === 'error') {
          reject(toError(message?.data ?? message, 'Failed to load keys'))
        } else {
          resolve(message.data as SSHKey[])
        }
      }
      backendService.on('key:list', handler)
      backendService.send({ type: 'key:list' })
    })
  },

  async save(key: Omit<SSHKey, 'id' | 'createdAt'>, privateKey: string): Promise<SSHKey> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        backendService.off('key:save', handler)
        backendService.off('error', errorHandler)
        reject(new Error('Request timeout - no response from backend'))
      }, 10000)

      const handler = (message: any) => {
        clearTimeout(timeout)
        backendService.off('key:save', handler)
        backendService.off('error', errorHandler)
        if (message.type === 'error') {
          reject(toError(message?.data ?? message, 'Failed to save key'))
        } else {
          resolve(message.data as SSHKey)
        }
      }

      const errorHandler = (error: any) => {
        clearTimeout(timeout)
        backendService.off('key:save', handler)
        backendService.off('error', errorHandler)
        reject(toError(error, 'Failed to save key'))
      }

      backendService.on('key:save', handler)
      backendService.on('error', errorHandler)
      backendService.send({
        type: 'key:save',
        data: { key, privateKey }
      })
    })
  },

  async import(name: string, privateKey: string, passphrase?: string): Promise<SSHKey> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        backendService.off('key:import', handler)
        backendService.off('error', errorHandler)
        reject(new Error('Request timeout - no response from backend'))
      }, 10000)

      const handler = (message: any) => {
        clearTimeout(timeout)
        backendService.off('key:import', handler)
        backendService.off('error', errorHandler)
        if (message.type === 'error') {
          reject(toError(message?.data ?? message, 'Failed to import key'))
        } else {
          resolve(message.data as SSHKey)
        }
      }

      const errorHandler = (error: any) => {
        clearTimeout(timeout)
        backendService.off('key:import', handler)
        backendService.off('error', errorHandler)
        reject(toError(error, 'Failed to import key'))
      }

      backendService.on('key:import', handler)
      backendService.on('error', errorHandler)
      backendService.send({
        type: 'key:import',
        data: { name, privateKey, passphrase: passphrase || '' }
      })
    })
  },

  async update(key: SSHKey): Promise<SSHKey> {
    return new Promise((resolve, reject) => {
      const handler = (message: any) => {
        backendService.off('key:update', handler)
        if (message.type === 'error') {
          reject(toError(message?.data ?? message, 'Failed to update key'))
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
          reject(toError(message?.data ?? message, 'Failed to delete key'))
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
      const timeout = setTimeout(() => {
        backendService.off('key:export', handler)
        backendService.off('error', errorHandler)
        reject(new Error('Export timeout - no response from backend'))
      }, 30000)

      const handler = (message: any) => {
        clearTimeout(timeout)
        backendService.off('key:export', handler)
        backendService.off('error', errorHandler)
        if (message.type === 'error') {
          reject(toError(message?.data ?? message, 'Failed to export key'))
        } else {
          resolve()
        }
      }

      const errorHandler = (error: any) => {
        clearTimeout(timeout)
        backendService.off('key:export', handler)
        backendService.off('error', errorHandler)
        reject(toError(error, 'Failed to export key'))
      }

      backendService.on('key:export', handler)
      backendService.on('error', errorHandler)
      backendService.send({
        type: 'key:export',
        data: { key_id: keyId, connection_id: connectionId }
      })
    })
  }
}
