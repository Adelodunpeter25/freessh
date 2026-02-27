import { backendService } from '../backend'
import { ImportOpenSSHResponse } from '@/types/export'

export const importOpenSSHService = {
  async import(data: Uint8Array): Promise<ImportOpenSSHResponse> {
    return backendService.request<ImportOpenSSHResponse>(
      {
        type: 'import:openssh',
        data: { data: Array.from(data) }
      },
      'import:openssh',
      15000,
    )
  }
}
