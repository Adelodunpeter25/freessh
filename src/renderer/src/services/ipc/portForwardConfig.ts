import { backendService } from './backend'
import { PortForwardConfig } from '@/types'

export const portForwardConfigService = {
  getAll(): Promise<PortForwardConfig[]> {
    return backendService.request<PortForwardConfig[]>(
      {
        type: 'portforward_config:list',
        data: {}
      },
      'portforward_config:list',
      10000,
    )
  },

  get(id: string): Promise<PortForwardConfig> {
    return backendService.request<PortForwardConfig>(
      {
        type: 'portforward_config:get',
        data: { id }
      },
      'portforward_config:get',
      10000,
    )
  },

  create(config: Omit<PortForwardConfig, 'id'>): Promise<PortForwardConfig> {
    return backendService.request<PortForwardConfig>(
      {
        type: 'portforward_config:create',
        data: config
      },
      'portforward_config:create',
      10000,
    )
  },

  update(config: PortForwardConfig): Promise<PortForwardConfig> {
    return backendService.request<PortForwardConfig>(
      {
        type: 'portforward_config:update',
        data: config
      },
      'portforward_config:update',
      10000,
    )
  },

  delete(id: string): Promise<void> {
    return backendService.request<void>(
      {
        type: 'portforward_config:delete',
        data: { id }
      },
      'portforward_config:delete',
      10000,
    )
  }
}
