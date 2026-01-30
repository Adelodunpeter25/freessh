import { backendService } from './backend'
import { ConnectionConfig, Session, IPCMessage } from '../../types'

export const sshService = {
  connect(config: ConnectionConfig, timeoutMs: number = 30000): Promise<Session> {
    return new Promise((resolve, reject) => {
      let timeoutId: NodeJS.Timeout

      const cleanup = () => {
        clearTimeout(timeoutId)
        backendService.off('session_status', handler)
        backendService.off('error', handler)
      }

      const handler = (message: IPCMessage) => {
        if (message.type === 'session_status') {
          cleanup()
          resolve(message.data as Session)
        } else if (message.type === 'error') {
          cleanup()
          reject(new Error(message.data.error))
        }
      }

      timeoutId = setTimeout(() => {
        cleanup()
        reject(new Error('Connection timeout - server did not respond within 30 seconds'))
      }, timeoutMs)

      backendService.on('session_status', handler)
      backendService.on('error', handler)

      backendService.send({
        type: 'connect',
        data: { config }
      })
    })
  },

  disconnect(sessionId: string, timeoutMs: number = 10000): Promise<void> {
    return new Promise((resolve, reject) => {
      let timeoutId: NodeJS.Timeout

      const cleanup = () => {
        clearTimeout(timeoutId)
        backendService.off('session_status', handler)
        backendService.off('error', handler)
      }

      const handler = (message: IPCMessage) => {
        if (message.session_id === sessionId) {
          if (message.type === 'session_status') {
            cleanup()
            resolve()
          } else if (message.type === 'error') {
            cleanup()
            reject(new Error(message.data.error))
          }
        }
      }

      timeoutId = setTimeout(() => {
        cleanup()
        reject(new Error('Disconnect timeout'))
      }, timeoutMs)

      backendService.on('session_status', handler)
      backendService.on('error', handler)

      backendService.send({
        type: 'disconnect',
        session_id: sessionId
      })
    })
  }
}
