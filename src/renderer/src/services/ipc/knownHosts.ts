import { backendService } from './backend'
import { KnownHost } from '@/types/knownHost'

export const knownHostsService = {
  async getAll(): Promise<KnownHost[]> {
    return backendService.request<KnownHost[]>(
      {
        type: 'known_host:list',
        data: {}
      },
      'known_host:list',
      10000,
    )
  },

  async remove(id: string): Promise<void> {
    await backendService.request<void>(
      {
        type: 'known_host:remove',
        data: { id }
      },
      'known_host:remove',
      10000,
    )
  },

  async trust(hostname: string, port: number, fingerprint: string, publicKey: string): Promise<void> {
    await backendService.request<void>(
      {
        type: 'known_host:trust',
        data: { hostname, port, fingerprint, publicKey }
      },
      'known_host:trust',
      10000,
    )
  },

  async importFromSSH(): Promise<number> {
    const data = await backendService.request<{ count?: number }>(
      {
        type: 'known_host:import',
        data: {}
      },
      'known_host:import',
      10000,
    )

    return data.count || 0
  }
}
