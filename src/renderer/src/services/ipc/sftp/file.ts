import { backendService } from '../backend'
import { IPCMessage } from '../../../types'

export const readFile = (sessionId: string, path: string, binary?: boolean): Promise<string> => {
  return new Promise((resolve, reject) => {
    const handler = (message: IPCMessage) => {
      if (message.session_id === sessionId && message.type === 'sftp:readfile') {
        backendService.off('sftp:readfile')
        backendService.off('error')
        resolve(message.data.content as string)
      } else if (message.session_id === sessionId && message.type === 'error') {
        backendService.off('sftp:readfile')
        backendService.off('error')
        reject(new Error(message.data.error))
      }
    }

    backendService.on('sftp:readfile', handler)
    backendService.on('error', handler)

    backendService.send({
      type: 'sftp:readfile',
      session_id: sessionId,
      data: { path, binary: binary ?? false }
    })
  })
}

export const writeFile = (sessionId: string, path: string, content: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const handler = (message: IPCMessage) => {
      if (message.session_id === sessionId && message.type === 'sftp:writefile') {
        backendService.off('sftp:writefile')
        resolve()
      } else if (message.type === 'error') {
        backendService.off('error')
        reject(new Error(message.data.error))
      }
    }

    backendService.on('sftp:writefile', handler)
    backendService.on('error', handler)

    backendService.send({
      type: 'sftp:writefile',
      session_id: sessionId,
      data: { path, content }
    })
  })
}
