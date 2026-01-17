import { backendService } from './backend'
import { TunnelConfig, TunnelInfo, IPCMessage } from '@/types'

export const portForwardService = {
  create(sessionId: string, config: TunnelConfig): Promise<TunnelInfo> {
    return new Promise((resolve, reject) => {
      const handler = (message: IPCMessage) => {
        if (message.session_id === sessionId && message.type === 'portforward:create') {
          backendService.off('portforward:create')
          backendService.off('error')
          resolve(message.data as TunnelInfo)
        } else if (message.type === 'error') {
          backendService.off('portforward:create')
          backendService.off('error')
          reject(new Error(message.data.error))
        }
      }

      backendService.on('portforward:create', handler)
      backendService.on('error', handler)

      backendService.send({
        type: 'portforward:create',
        session_id: sessionId,
        data: { config }
      })
    })
  },

  stop(sessionId: string, tunnelId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const handler = (message: IPCMessage) => {
        if (message.session_id === sessionId && message.type === 'portforward:stop') {
          backendService.off('portforward:stop')
          backendService.off('error')
          resolve()
        } else if (message.type === 'error') {
          backendService.off('portforward:stop')
          backendService.off('error')
          reject(new Error(message.data.error))
        }
      }

      backendService.on('portforward:stop', handler)
      backendService.on('error', handler)

      backendService.send({
        type: 'portforward:stop',
        session_id: sessionId,
        data: { tunnel_id: tunnelId }
      })
    })
  },

  list(sessionId: string): Promise<TunnelInfo[]> {
    return new Promise((resolve, reject) => {
      const handler = (message: IPCMessage) => {
        if (message.session_id === sessionId && message.type === 'portforward:list') {
          backendService.off('portforward:list')
          backendService.off('error')
          resolve(message.data as TunnelInfo[])
        } else if (message.type === 'error') {
          backendService.off('portforward:list')
          backendService.off('error')
          reject(new Error(message.data.error))
        }
      }

      backendService.on('portforward:list', handler)
      backendService.on('error', handler)

      backendService.send({
        type: 'portforward:list',
        session_id: sessionId,
        data: {}
      })
    })
  }
}
