import { backendService } from './backend'
import { Session } from '../../types'

export const sessionService = {
  listSessions(): Promise<Session[]> {
    return backendService.request<Session[]>(
      {
        type: 'session_list'
      },
      'session_list',
      10000,
    )
  },

  async connectLocal(): Promise<Session> {
    const session = await backendService.request<Session>(
      {
        type: 'connect_local'
      },
      'session_status',
      10000,
    )

    if (session.status === 'error') {
      throw new Error(session.error || 'Failed to create local terminal')
    }

    return session
  }
}
