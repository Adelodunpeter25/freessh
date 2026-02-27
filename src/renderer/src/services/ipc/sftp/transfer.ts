import { backendService } from '../backend'
import { TransferProgress, IPCMessage } from '../../../types'

export const upload = (
  sessionId: string,
  localPath: string,
  remotePath: string,
  onProgress?: (progress: TransferProgress) => void
): Promise<void> => {
  return new Promise((resolve, reject) => {
    let requestId = ''
    let progressHandler: ((message: IPCMessage) => void) | undefined

    const cleanup = (handler: (message: IPCMessage) => void) => {
      backendService.off('sftp:upload', handler)
      backendService.off('error', handler)
      if (progressHandler) {
        backendService.off('sftp:progress', progressHandler)
      }
    }

    if (onProgress) {
      progressHandler = (message: IPCMessage) => {
        if (
          message.request_id === requestId &&
          message.session_id === sessionId &&
          message.type === 'sftp:progress'
        ) {
          onProgress(message.data as TransferProgress)
        }
      }
      backendService.on('sftp:progress', progressHandler)
    }

    const handler = (message: IPCMessage) => {
      if (message.request_id !== requestId) return

      if (message.session_id === sessionId && message.type === 'sftp:upload') {
        cleanup(handler)
        resolve()
      } else if (message.type === 'error') {
        cleanup(handler)
        reject(new Error(message.data.error))
      }
    }

    backendService.on('sftp:upload', handler)
    backendService.on('error', handler)

    requestId = backendService.send({
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
    let requestId = ''
    let progressHandler: ((message: IPCMessage) => void) | undefined

    const cleanup = (handler: (message: IPCMessage) => void) => {
      backendService.off('sftp:download', handler)
      backendService.off('error', handler)
      if (progressHandler) {
        backendService.off('sftp:progress', progressHandler)
      }
    }

    if (onProgress) {
      progressHandler = (message: IPCMessage) => {
        if (
          message.request_id === requestId &&
          message.session_id === sessionId &&
          message.type === 'sftp:progress'
        ) {
          onProgress(message.data as TransferProgress)
        }
      }
      backendService.on('sftp:progress', progressHandler)
    }

    const handler = (message: IPCMessage) => {
      if (message.request_id !== requestId) return

      if (message.session_id === sessionId && message.type === 'sftp:download') {
        cleanup(handler)
        resolve()
      } else if (message.type === 'error') {
        cleanup(handler)
        reject(new Error(message.data.error))
      }
    }

    backendService.on('sftp:download', handler)
    backendService.on('error', handler)

    requestId = backendService.send({
      type: 'sftp:download',
      session_id: sessionId,
      data: { remote_path: remotePath, local_path: localPath }
    })
  })
}

export const cancel = (sessionId: string, transferId: string): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    let requestId = ''

    const handler = (message: IPCMessage) => {
      if (message.request_id !== requestId) return

      if (message.type === 'sftp:cancel') {
        backendService.off('sftp:cancel', handler)
        backendService.off('error', handler)
        resolve(message.data?.cancelled ?? false)
      } else if (message.type === 'error') {
        backendService.off('sftp:cancel', handler)
        backendService.off('error', handler)
        reject(new Error(message.data.error))
      }
    }

    backendService.on('sftp:cancel', handler)
    backendService.on('error', handler)

    requestId = backendService.send({
      type: 'sftp:cancel',
      session_id: sessionId,
      data: { transfer_id: transferId }
    })
  })
}
