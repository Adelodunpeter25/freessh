import { backendService } from './backend'
import { ConnectionConfig, Session } from '../../types'

const DEFAULT_CONNECT_TIMEOUT_MS = 70000

export const connectionService = {
  list(): Promise<ConnectionConfig[]> {
    return backendService.request<ConnectionConfig[]>(
      {
        type: 'connection:list'
      },
      'connection:list',
      10000,
    )
  },

  get(id: string): Promise<ConnectionConfig> {
    return backendService.request<ConnectionConfig>(
      {
        type: 'connection:get',
        data: { id }
      },
      'connection:get',
      10000,
    )
  },

  delete(id: string): Promise<void> {
    return backendService.request<void>(
      {
        type: 'connection:delete',
        data: { id }
      },
      'connection:delete',
      10000,
    )
  },

  update(config: ConnectionConfig): Promise<void> {
    return backendService.request<void>(
      {
        type: 'connection:update',
        data: config
      },
      'connection:update',
      10000,
    )
  },

  connect(config: ConnectionConfig, timeoutMs: number = DEFAULT_CONNECT_TIMEOUT_MS): Promise<Session> {
    return backendService
      .request<Session>(
        {
          type: 'connection:connect',
          data: config
        },
        'session_status',
        timeoutMs,
      )
      .catch((error) => {
        if (error instanceof Error && error.message.startsWith('Request timeout')) {
          throw new Error(
            `Connection timeout - server did not respond within ${Math.round(timeoutMs / 1000)} seconds`,
          )
        }
        throw error
      })
  }
}
