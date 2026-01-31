import { backendService } from '../backend'
import { IPCMessage } from '../../../types'

export const deleteFile = (sessionId: string, path: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const handler = (message: IPCMessage) => {
      if (message.session_id === sessionId && message.type === 'sftp:delete') {
        backendService.off('sftp:delete')
        resolve()
      } else if (message.type === 'error') {
        backendService.off('error')
        reject(new Error(message.data.error))
      }
    }

    backendService.on('sftp:delete', handler)
    backendService.on('error', handler)

    backendService.send({
      type: 'sftp:delete',
      session_id: sessionId,
      data: { path }
    })
  })
}

export const mkdir = (sessionId: string, path: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const handler = (message: IPCMessage) => {
      if (message.session_id === sessionId && message.type === 'sftp:mkdir') {
        backendService.off('sftp:mkdir')
        resolve()
      } else if (message.type === 'error') {
        backendService.off('error')
        reject(new Error(message.data.error))
      }
    }

    backendService.on('sftp:mkdir', handler)
    backendService.on('error', handler)

    backendService.send({
      type: 'sftp:mkdir',
      session_id: sessionId,
      data: { path }
    })
  })
}

export const rename = (sessionId: string, oldPath: string, newPath: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const handler = (message: IPCMessage) => {
      if (message.session_id === sessionId && message.type === 'sftp:rename') {
        backendService.off('sftp:rename')
        resolve()
      } else if (message.type === 'error') {
        backendService.off('error')
        reject(new Error(message.data.error))
      }
    }

    backendService.on('sftp:rename', handler)
    backendService.on('error', handler)

    backendService.send({
      type: 'sftp:rename',
      session_id: sessionId,
      data: { old_path: oldPath, new_path: newPath }
    })
  })
}

export const chmod = (sessionId: string, path: string, mode: number): Promise<void> => {
  return new Promise((resolve, reject) => {
    const handler = (message: IPCMessage) => {
      if (message.session_id === sessionId && message.type === 'sftp:chmod') {
        backendService.off('sftp:chmod')
        resolve()
      } else if (message.type === 'error') {
        backendService.off('error')
        reject(new Error(message.data.error))
      }
    }

    backendService.on('sftp:chmod', handler)
    backendService.on('error', handler)

    backendService.send({
      type: 'sftp:chmod',
      session_id: sessionId,
      data: { path, mode }
    })
  })
}
