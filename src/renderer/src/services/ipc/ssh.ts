import { backendService } from './backend'
import { ConnectionConfig, Session } from '../../types'

export const sshService = {
  async connect(config: ConnectionConfig, timeoutMs: number = 10000): Promise<Session> {
    try {
      return await backendService.request<Session>(
        {
        type: 'connect',
        data: { config }
        },
        'session_status',
        timeoutMs,
      )
    } catch (error) {
      if (error instanceof Error && error.message.startsWith('Request timeout')) {
        throw new Error('Connection timeout - server did not respond within 10 seconds')
      }
      throw error
    }
  },

  async disconnect(sessionId: string, timeoutMs: number = 10000): Promise<void> {
    try {
      await backendService.request<Session>(
        {
        type: 'disconnect',
        session_id: sessionId
        },
        'session_status',
        timeoutMs,
      )
    } catch (error) {
      if (error instanceof Error && error.message.startsWith('Request timeout')) {
        throw new Error('Disconnect timeout')
      }
      throw error
    }
  }
}
