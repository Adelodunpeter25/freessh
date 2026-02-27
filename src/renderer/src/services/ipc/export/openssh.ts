import { backendService } from '../backend'
import { ExportOpenSSHResponse } from '@/types/export'

export const exportOpenSSHService = {
  async export(): Promise<ExportOpenSSHResponse> {
    return backendService.request<ExportOpenSSHResponse>(
      {
        type: 'export:openssh',
        data: {}
      },
      'export:openssh',
      15000,
    )
  }
}
