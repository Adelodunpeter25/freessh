import { backendService } from './backend'
import { ConnectionConfig, Session, IPCMessage } from '../../types'

export const sshService = {
  connect(config: ConnectionConfig, timeoutMs: number = 10000): Promise<Session> {
    console.log('[SSH] Starting connection to:', config.host)
    return new Promise((resolve, reject) => {
      let timeoutId: NodeJS.Timeout

      const cleanup = () => {
        console.log('[SSH] Cleaning up connection handlers')
        clearTimeout(timeoutId)
        backendService.off('session_status', handler)
        backendService.off('error', handler)
      }

      const handler = (message: IPCMessage) => {
        console.log('[SSH] Received message:', message.type, message)
        if (message.type === 'session_status') {
          console.log('[SSH] Connection successful')
          cleanup()
          resolve(message.data as Session)
        } else if (message.type === 'error') {
          console.log('[SSH] Connection error:', message.data.error)
          cleanup()
          reject(new Error(message.data.error))
        }
      }

      timeoutId = setTimeout(() => {
        console.log('[SSH] Connection timeout after 10 seconds')
        cleanup()
        reject(new Error('Connection timeout - server did not respond within 10 seconds'))
      }, timeoutMs)

      console.log('[SSH] Registering event handlers and sending connect message')
      backendService.on('session_status', handler)
      backendService.on('error', handler)

      backendService.send({
        type: 'connect',
        data: { config }
      })
      console.log('[SSH] Connect message sent to backend')
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
