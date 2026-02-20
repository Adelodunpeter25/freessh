import { backendService } from './backend'
import { Session, IPCMessage } from '../../types'

export const sessionService = {
  listSessions(): Promise<Session[]> {
    return new Promise((resolve, reject) => {
      const handler = (message: IPCMessage) => {
        if (message.type === 'session_list') {
          backendService.off('session_list')
          resolve(message.data as Session[])
        } else if (message.type === 'error') {
          backendService.off('error')
          reject(new Error(message.data.error))
        }
      }

      backendService.on('session_list', handler)
      backendService.on('error', handler)

      backendService.send({
        type: 'session_list'
      })
    })
  },

  connectLocal(): Promise<Session> {
    return new Promise((resolve, reject) => {
      const handler = (message: IPCMessage) => {
        if (message.type === 'session_status') {
          backendService.off('session_status', handler)
          const session = message.data as Session
          if (session.status === 'error') {
            reject(new Error(session.error || 'Failed to create local terminal'))
          } else {
            resolve(session)
          }
        }
      }

      backendService.on('session_status', handler)

      backendService.send({
        type: 'connect_local'
      })
    })
  }
}
