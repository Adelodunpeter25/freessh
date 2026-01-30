import { backendService } from '../backend'
import { IPCMessage } from '@/types'
import { ImportFreeSSHResponse } from '@/types/export'

export const importFreeSSHService = {
  async import(data: Uint8Array): Promise<ImportFreeSSHResponse> {
    return new Promise((resolve, reject) => {
      const handler = (message: IPCMessage) => {
        if (message.type === 'import:freessh') {
          backendService.off('import:freessh')
          backendService.off('error')
          resolve(message.data as ImportFreeSSHResponse)
        } else if (message.type === 'error') {
          backendService.off('import:freessh')
          backendService.off('error')
          reject(new Error(message.data.error))
        }
      }

      backendService.on('import:freessh', handler)
      backendService.on('error', handler)

      backendService.send({
        type: 'import:freessh',
        data: { data }
      })
    })
  }
}
