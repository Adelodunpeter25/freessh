import { backendService } from './ipc/backend'
import { KnownHost } from '@/types/knownHost'

export const knownHostsService = {
  async getAll(): Promise<KnownHost[]> {
    return new Promise((resolve, reject) => {
      const handler = (message: any) => {
        backendService.off('known_host:list', handler)
        backendService.off('error', errorHandler)
        if (message.type === 'error') {
          reject(new Error(message.data))
        } else {
          resolve(message.data || [])
        }
      }

      const errorHandler = (error: any) => {
        backendService.off('known_host:list', handler)
        backendService.off('error', errorHandler)
        reject(error)
      }

      backendService.on('known_host:list', handler)
      backendService.on('error', errorHandler)

      backendService.send({
        type: 'known_host:list',
        data: {}
      })
    })
  },

  async remove(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const handler = (message: any) => {
        backendService.off('known_host:remove', handler)
        backendService.off('error', errorHandler)
        if (message.type === 'error') {
          reject(new Error(message.data))
        } else {
          resolve()
        }
      }

      const errorHandler = (error: any) => {
        backendService.off('known_host:remove', handler)
        backendService.off('error', errorHandler)
        reject(error)
      }

      backendService.on('known_host:remove', handler)
      backendService.on('error', errorHandler)

      backendService.send({
        type: 'known_host:remove',
        data: { id }
      })
    })
  },

  async trust(hostname: string, port: number, fingerprint: string, publicKey: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const handler = (message: any) => {
        backendService.off('known_host:trust', handler)
        backendService.off('error', errorHandler)
        if (message.type === 'error') {
          reject(new Error(message.data))
        } else {
          resolve()
        }
      }

      const errorHandler = (error: any) => {
        backendService.off('known_host:trust', handler)
        backendService.off('error', errorHandler)
        reject(error)
      }

      backendService.on('known_host:trust', handler)
      backendService.on('error', errorHandler)

      backendService.send({
        type: 'known_host:trust',
        data: { hostname, port, fingerprint, publicKey }
      })
    })
  },

  async importFromSSH(): Promise<number> {
    return new Promise((resolve, reject) => {
      const handler = (message: any) => {
        backendService.off('known_host:import', handler)
        backendService.off('error', errorHandler)
        if (message.type === 'error') {
          reject(new Error(message.data))
        } else {
          resolve(message.data.count || 0)
        }
      }

      const errorHandler = (error: any) => {
        backendService.off('known_host:import', handler)
        backendService.off('error', errorHandler)
        reject(error)
      }

      backendService.on('known_host:import', handler)
      backendService.on('error', errorHandler)

      backendService.send({
        type: 'known_host:import',
        data: {}
      })
    })
  }
}
