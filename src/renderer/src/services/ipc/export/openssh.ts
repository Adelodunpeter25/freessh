import { backendService } from '../backend'
import { IPCMessage } from '@/types'
import { ExportOpenSSHResponse } from '@/types/export'

export const exportOpenSSHService = {
  async export(): Promise<ExportOpenSSHResponse> {
    return new Promise((resolve, reject) => {
      const handler = (message: IPCMessage) => {
        if (message.type === 'export:openssh') {
          backendService.off('export:openssh')
          backendService.off('error')
          resolve(message.data as ExportOpenSSHResponse)
        } else if (message.type === 'error') {
          backendService.off('export:openssh')
          backendService.off('error')
          reject(new Error(message.data.error))
        }
      }

      backendService.on('export:openssh', handler)
      backendService.on('error', handler)

      backendService.send({
        type: 'export:openssh',
        data: {}
      })
    })
  }
}
