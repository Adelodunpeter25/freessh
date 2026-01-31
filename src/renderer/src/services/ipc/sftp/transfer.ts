import { backendService } from '../backend'
import { TransferProgress, IPCMessage } from '../../../types'

export const upload = (
  sessionId: string,
  localPath: string,
  remotePath: string,
  onProgress?: (progress: TransferProgress) => void
): Promise<void> => {
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
}

export const download = (
  sessionId: string,
  remotePath: string,
  localPath: string,
  onProgress?: (progress: TransferProgress) => void
): Promise<void> => {
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
}

export const cancel = (sessionId: string, transferId: string): Promise<boolean> => {
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
}
