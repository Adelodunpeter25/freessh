import { backendService } from '../backend'
import { IPCMessage } from '@/types'
import { ExportFreeSSHResponse } from '@/types/export'

export const exportFreeSSHService = {
  async export(): Promise<ExportFreeSSHResponse> {
    return new Promise((resolve, reject) => {
      const handler = (message: IPCMessage) => {
        if (message.type === 'export:freessh') {
          backendService.off('export:freessh')
          backendService.off('error')
          resolve(message.data as ExportFreeSSHResponse)
        } else if (message.type === 'error') {
          backendService.off('export:freessh')
          backendService.off('error')
          reject(new Error(message.data.error))
        }
      }

      backendService.on('export:freessh', handler)
      backendService.on('error', handler)

      backendService.send({
        type: 'export:freessh',
        data: {}
      })
    })
  }
}
