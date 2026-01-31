import { backendService } from '../backend'
import { FileInfo, IPCMessage } from '../../../types'

export const list = (sessionId: string, path: string): Promise<FileInfo[]> => {
  return new Promise((resolve, reject) => {
    const handler = (message: IPCMessage) => {
      if (message.session_id === sessionId && message.type === 'sftp:list') {
        backendService.off('sftp:list')
        resolve(message.data as FileInfo[])
      } else if (message.type === 'error') {
        backendService.off('error')
        reject(new Error(message.data.error))
      }
    }

    backendService.on('sftp:list', handler)
    backendService.on('error', handler)

    backendService.send({
      type: 'sftp:list',
      session_id: sessionId,
      data: { path }
    })
  })
}
