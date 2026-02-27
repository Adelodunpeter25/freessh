import { backendService } from '../backend'
import { ExportFreeSSHResponse } from '@/types/export'

export const exportFreeSSHService = {
  async export(): Promise<ExportFreeSSHResponse> {
    return backendService.request<ExportFreeSSHResponse>(
      {
        type: 'export:freessh',
        data: {}
      },
      'export:freessh',
      15000,
    )
  }
}
