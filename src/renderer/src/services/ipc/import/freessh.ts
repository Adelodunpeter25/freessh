import { backendService } from '../backend'
import { ImportFreeSSHResponse } from '@/types/export'

export const importFreeSSHService = {
  async import(data: Uint8Array): Promise<ImportFreeSSHResponse> {
    return backendService.request<ImportFreeSSHResponse>(
      {
        type: 'import:freessh',
        data: { data: Array.from(data) }
      },
      'import:freessh',
      15000,
    )
  }
}
