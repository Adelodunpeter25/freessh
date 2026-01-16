import { backendService } from './backend'
import { FileInfo, TransferProgress, IPCMessage } from '../../types'

export const sftpService = {
  list(sessionId: string, path: string): Promise<FileInfo[]> {
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
  },

  upload(
    sessionId: string,
    localPath: string,
    remotePath: string,
    onProgress?: (progress: TransferProgress) => void
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      if (onProgress) {
        const progressHandler = (message: IPCMessage) => {
          if (message.session_id === sessionId && message.type === 'sftp:progress') {
            onProgress(message.data as TransferProgress)
          }
        }
        backendService.on('sftp:progress', progressHandler)
      }

      const handler = (message: IPCMessage) => {
        if (message.session_id === sessionId && message.type === 'sftp:upload') {
          backendService.off('sftp:upload')
          backendService.off('sftp:progress')
          resolve()
        } else if (message.type === 'error') {
          backendService.off('error')
          backendService.off('sftp:progress')
          reject(new Error(message.data.error))
        }
      }

      backendService.on('sftp:upload', handler)
      backendService.on('error', handler)

      backendService.send({
        type: 'sftp:upload',
        session_id: sessionId,
        data: { local_path: localPath, remote_path: remotePath }
      })
    })
  },

  download(
    sessionId: string,
    remotePath: string,
    localPath: string,
    onProgress?: (progress: TransferProgress) => void
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      if (onProgress) {
        const progressHandler = (message: IPCMessage) => {
          if (message.session_id === sessionId && message.type === 'sftp:progress') {
            onProgress(message.data as TransferProgress)
          }
        }
        backendService.on('sftp:progress', progressHandler)
      }

      const handler = (message: IPCMessage) => {
        if (message.session_id === sessionId && message.type === 'sftp:download') {
          backendService.off('sftp:download')
          backendService.off('sftp:progress')
          resolve()
        } else if (message.type === 'error') {
          backendService.off('error')
          backendService.off('sftp:progress')
          reject(new Error(message.data.error))
        }
      }

      backendService.on('sftp:download', handler)
      backendService.on('error', handler)

      backendService.send({
        type: 'sftp:download',
        session_id: sessionId,
        data: { remote_path: remotePath, local_path: localPath }
      })
    })
  },

  delete(sessionId: string, path: string): Promise<void> {
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
  },

  mkdir(sessionId: string, path: string): Promise<void> {
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
  },

  rename(sessionId: string, oldPath: string, newPath: string): Promise<void> {
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
  },

  cancel(sessionId: string, transferId: string): Promise<boolean> {
    return new Promise((resolve) => {
      const handler = (message: IPCMessage) => {
        if (message.type === 'sftp:cancel') {
          backendService.off('sftp:cancel')
          resolve(message.data?.cancelled ?? false)
        }
      }

      backendService.on('sftp:cancel', handler)

      backendService.send({
        type: 'sftp:cancel',
        session_id: sessionId,
        data: { transfer_id: transferId }
      })
    })
  },

  readFile(sessionId: string, path: string, binary?: boolean): Promise<string> {
    return new Promise((resolve, reject) => {
      console.log('[SFTP] readFile request:', { sessionId, path, binary })
      
      const handler = (message: IPCMessage) => {
        console.log('[SFTP] readFile received message:', message.type, message.session_id)
        if (message.session_id === sessionId && message.type === 'sftp:readfile') {
          console.log('[SFTP] readFile success')
          backendService.off('sftp:readfile')
          backendService.off('error')
          resolve(message.data.content as string)
        } else if (message.session_id === sessionId && message.type === 'error') {
          console.log('[SFTP] readFile error:', message.data)
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
  },

  writeFile(sessionId: string, path: string, content: string): Promise<void> {
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
}
