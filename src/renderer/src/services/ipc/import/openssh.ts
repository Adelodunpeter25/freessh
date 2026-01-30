import { backendService } from '../backend'
import { IPCMessage } from '@/types'
import { ImportOpenSSHResponse } from '@/types/export'

export const importOpenSSHService = {
  async import(data: Uint8Array): Promise<ImportOpenSSHResponse> {
    return new Promise((resolve, reject) => {
      const handler = (message: IPCMessage) => {
        if (message.type === 'import:openssh') {
          backendService.off('import:openssh')
          backendService.off('error')
          resolve(message.data as ImportOpenSSHResponse)
        } else if (message.type === 'error') {
          backendService.off('import:openssh')
          backendService.off('error')
          reject(new Error(message.data.error))
        }
      }

      backendService.on('import:openssh', handler)
      backendService.on('error', handler)

      backendService.send({
        type: 'import:openssh',
        data: { data: Array.from(data) }
      })
    })
  }
}
