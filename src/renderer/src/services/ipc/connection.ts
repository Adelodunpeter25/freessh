import { backendService } from './backend'
import { ConnectionConfig, Session, IPCMessage } from '../../types'

export const connectionService = {
  list(): Promise<ConnectionConfig[]> {
    return new Promise((resolve, reject) => {
      const handler = (message: IPCMessage) => {
        if (message.type === 'connection:list') {
          backendService.off('connection:list')
          resolve(message.data as ConnectionConfig[])
        } else if (message.type === 'error') {
          backendService.off('error')
          reject(new Error(message.data.error))
        }
      }

      backendService.on('connection:list', handler)
      backendService.on('error', handler)

      backendService.send({
        type: 'connection:list'
      })
    })
  },

  get(id: string): Promise<ConnectionConfig> {
    return new Promise((resolve, reject) => {
      const handler = (message: IPCMessage) => {
        if (message.type === 'connection:get') {
          backendService.off('connection:get')
          resolve(message.data as ConnectionConfig)
        } else if (message.type === 'error') {
          backendService.off('error')
          reject(new Error(message.data.error))
        }
      }

      backendService.on('connection:get', handler)
      backendService.on('error', handler)

      backendService.send({
        type: 'connection:get',
        data: { id }
      })
    })
  },

  delete(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const handler = (message: IPCMessage) => {
        if (message.type === 'connection:delete') {
          backendService.off('connection:delete')
          resolve()
        } else if (message.type === 'error') {
          backendService.off('error')
          reject(new Error(message.data.error))
        }
      }

      backendService.on('connection:delete', handler)
      backendService.on('error', handler)

      backendService.send({
        type: 'connection:delete',
        data: { id }
      })
    })
  },

  update(config: ConnectionConfig): Promise<void> {
    return new Promise((resolve, reject) => {
      const handler = (message: IPCMessage) => {
        if (message.type === 'connection:update') {
          backendService.off('connection:update')
          resolve()
        } else if (message.type === 'error') {
          backendService.off('error')
          reject(new Error(message.data.error))
        }
      }

      backendService.on('connection:update', handler)
      backendService.on('error', handler)

      backendService.send({
        type: 'connection:update',
        data: config
      })
    })
  },

  connect(config: ConnectionConfig, timeoutMs: number = 10000): Promise<Session> {
    console.log('[Connection] Starting connection to:', config.host)
    return new Promise((resolve, reject) => {
      let timeoutId: NodeJS.Timeout

      const cleanup = () => {
        console.log('[Connection] Cleaning up handlers')
        clearTimeout(timeoutId)
        backendService.off('session_status', handler)
        backendService.off('error', handler)
      }

      const handler = (message: IPCMessage) => {
        console.log('[Connection] Received message:', message.type, message)
        if (message.type === 'session_status') {
          console.log('[Connection] Connection successful')
          cleanup()
          resolve(message.data as Session)
        } else if (message.type === 'error') {
          console.log('[Connection] Connection error:', message.data.error)
          cleanup()
          reject(new Error(message.data.error))
        }
      }

      timeoutId = setTimeout(() => {
        console.log('[Connection] Connection timeout after 10 seconds')
        cleanup()
        reject(new Error('Connection timeout - server did not respond within 10 seconds'))
      }, timeoutMs)

      console.log('[Connection] Registering handlers and sending connect message')
      backendService.on('session_status', handler)
      backendService.on('error', handler)

      backendService.send({
        type: 'connection:connect',
        data: config
      })
      console.log('[Connection] Connect message sent to backend')
    })
  }
}
