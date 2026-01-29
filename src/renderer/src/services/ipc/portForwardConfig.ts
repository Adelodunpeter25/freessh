import { backendService } from './ipc/backend'
import { PortForwardConfig, IPCMessage } from '@/types'

export const portForwardConfigService = {
  getAll(): Promise<PortForwardConfig[]> {
    return new Promise((resolve, reject) => {
      const handler = (message: IPCMessage) => {
        if (message.type === 'portforward_config:list') {
          backendService.off('portforward_config:list')
          backendService.off('error')
          resolve(message.data as PortForwardConfig[])
        } else if (message.type === 'error') {
          backendService.off('portforward_config:list')
          backendService.off('error')
          reject(new Error(message.data.error))
        }
      }

      backendService.on('portforward_config:list', handler)
      backendService.on('error', handler)

      backendService.send({
        type: 'portforward_config:list',
        data: {}
      })
    })
  },

  get(id: string): Promise<PortForwardConfig> {
    return new Promise((resolve, reject) => {
      const handler = (message: IPCMessage) => {
        if (message.type === 'portforward_config:get') {
          backendService.off('portforward_config:get')
          backendService.off('error')
          resolve(message.data as PortForwardConfig)
        } else if (message.type === 'error') {
          backendService.off('portforward_config:get')
          backendService.off('error')
          reject(new Error(message.data.error))
        }
      }

      backendService.on('portforward_config:get', handler)
      backendService.on('error', handler)

      backendService.send({
        type: 'portforward_config:get',
        data: { id }
      })
    })
  },

  create(config: Omit<PortForwardConfig, 'id'>): Promise<PortForwardConfig> {
    return new Promise((resolve, reject) => {
      const handler = (message: IPCMessage) => {
        if (message.type === 'portforward_config:create') {
          backendService.off('portforward_config:create')
          backendService.off('error')
          resolve(message.data as PortForwardConfig)
        } else if (message.type === 'error') {
          backendService.off('portforward_config:create')
          backendService.off('error')
          reject(new Error(message.data.error))
        }
      }

      backendService.on('portforward_config:create', handler)
      backendService.on('error', handler)

      backendService.send({
        type: 'portforward_config:create',
        data: config
      })
    })
  },

  update(config: PortForwardConfig): Promise<PortForwardConfig> {
    return new Promise((resolve, reject) => {
      const handler = (message: IPCMessage) => {
        if (message.type === 'portforward_config:update') {
          backendService.off('portforward_config:update')
          backendService.off('error')
          resolve(message.data as PortForwardConfig)
        } else if (message.type === 'error') {
          backendService.off('portforward_config:update')
          backendService.off('error')
          reject(new Error(message.data.error))
        }
      }

      backendService.on('portforward_config:update', handler)
      backendService.on('error', handler)

      backendService.send({
        type: 'portforward_config:update',
        data: config
      })
    })
  },

  delete(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const handler = (message: IPCMessage) => {
        if (message.type === 'portforward_config:delete') {
          backendService.off('portforward_config:delete')
          backendService.off('error')
          resolve()
        } else if (message.type === 'error') {
          backendService.off('portforward_config:delete')
          backendService.off('error')
          reject(new Error(message.data.error))
        }
      }

      backendService.on('portforward_config:delete', handler)
      backendService.on('error', handler)

      backendService.send({
        type: 'portforward_config:delete',
        data: { id }
      })
    })
  }
}
