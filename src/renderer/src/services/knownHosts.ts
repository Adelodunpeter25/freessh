import { backendService } from './ipc/backend'
import { KnownHost } from '@/types/knownHost'

export const knownHostsService = {
  async getAll(): Promise<KnownHost[]> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        backendService.off('known_host:list', handler)
        reject(new Error('Request timeout'))
      }, 5000)

      const handler = (message: any) => {
        clearTimeout(timeout)
        backendService.off('known_host:list', handler)
        resolve(message.data || [])
      }

      backendService.on('known_host:list', handler)
      backendService.send({
        type: 'known_host:list',
        data: {}
      })
    })
  },

  async remove(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        backendService.off('known_host:remove', handler)
        reject(new Error('Request timeout'))
      }, 5000)

      const handler = (message: any) => {
        clearTimeout(timeout)
        backendService.off('known_host:remove', handler)
        resolve()
      }

      backendService.on('known_host:remove', handler)
      backendService.send({
        type: 'known_host:remove',
        data: { id }
      })
    })
  },

  async trust(hostname: string, port: number, fingerprint: string, publicKey: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        backendService.off('known_host:trust', handler)
        reject(new Error('Request timeout'))
      }, 5000)

      const handler = (message: any) => {
        clearTimeout(timeout)
        backendService.off('known_host:trust', handler)
        resolve()
      }

      backendService.on('known_host:trust', handler)
      backendService.send({
        type: 'known_host:trust',
        data: { hostname, port, fingerprint, publicKey }
      })
    })
  },

  async importFromSSH(): Promise<number> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        backendService.off('known_host:import', handler)
        reject(new Error('Request timeout'))
      }, 5000)

      const handler = (message: any) => {
        clearTimeout(timeout)
        backendService.off('known_host:import', handler)
        resolve(message.data.count || 0)
      }

      backendService.on('known_host:import', handler)
      backendService.send({
        type: 'known_host:import',
        data: {}
      })
    })
  }
}
