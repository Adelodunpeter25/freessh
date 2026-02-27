import { backendService } from './backend'
import { TunnelConfig, RemoteTunnelConfig, DynamicTunnelConfig, TunnelInfo, CreateTunnelRequest } from '@/types'

export const portForwardService = {
  createLocal(connectionId: string, name: string, config: TunnelConfig): Promise<TunnelInfo> {
    return backendService.request<TunnelInfo>(
      {
        type: 'portforward:create',
        data: { type: 'local', connection_id: connectionId, name, config } as CreateTunnelRequest
      },
      'portforward:create',
      10000,
    )
  },

  createRemote(connectionId: string, name: string, config: RemoteTunnelConfig): Promise<TunnelInfo> {
    return backendService.request<TunnelInfo>(
      {
        type: 'portforward:create',
        data: { type: 'remote', connection_id: connectionId, name, remote: config } as CreateTunnelRequest
      },
      'portforward:create',
      10000,
    )
  },

  createDynamic(connectionId: string, name: string, config: DynamicTunnelConfig): Promise<TunnelInfo> {
    return backendService.request<TunnelInfo>(
      {
        type: 'portforward:create',
        data: { type: 'dynamic', connection_id: connectionId, name, dynamic: config } as CreateTunnelRequest
      },
      'portforward:create',
      10000,
    )
  },

  stop(connectionId: string, tunnelId: string): Promise<void> {
    return backendService.request<void>(
      {
        type: 'portforward:stop',
        data: { connection_id: connectionId, tunnel_id: tunnelId }
      },
      'portforward:stop',
      10000,
    )
  },

  list(sessionId: string): Promise<TunnelInfo[]> {
    return backendService.request<TunnelInfo[]>(
      {
        type: 'portforward:list',
        session_id: sessionId,
        data: {}
      },
      'portforward:list',
      10000,
    )
  }
}
