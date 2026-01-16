import { backendService } from './backend'
import { ConnectionConfig, Session, IPCMessage } from '../../types'

export const sshService = {
  connect(config: ConnectionConfig): Promise<Session> {
    return new Promise((resolve, reject) => {
      const handler = (message: IPCMessage) => {
        if (message.type === 'session_status') {
          backendService.off('session_status')
          resolve(message.data as Session)
        } else if (message.type === 'error') {
          backendService.off('error')
          reject(new Error(message.data.error))
        }
      }

      backendService.on('session_status', handler)
      backendService.on('error', handler)

      backendService.send({
        type: 'connect',
        data: { config }
      })
    })
  },

  disconnect(sessionId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const handler = (message: IPCMessage) => {
        if (message.session_id === sessionId) {
          if (message.type === 'session_status') {
            backendService.off('session_status')
            resolve()
          } else if (message.type === 'error') {
            backendService.off('error')
            reject(new Error(message.data.error))
          }
        }
      }

      backendService.on('session_status', handler)
      backendService.on('error', handler)

      backendService.send({
        type: 'disconnect',
        session_id: sessionId
      })
    })
  }
}
