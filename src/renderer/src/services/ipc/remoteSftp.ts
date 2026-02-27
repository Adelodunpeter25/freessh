import { backendService } from './backend'
import { IPCMessage, RemoteTransferResult, RemoteTransferProgress } from '../../types'

export const remoteSftpService = {
  remoteTransfer(
    sourceSessionId: string,
    destSessionId: string,
    sourcePath: string,
    destPath: string,
    onProgress?: (progress: RemoteTransferProgress) => void
  ): Promise<RemoteTransferResult> {
    return new Promise((resolve, reject) => {
      let requestId = ''
      let progressHandler: ((message: IPCMessage) => void) | null = null
      
      if (onProgress) {
        progressHandler = (message: IPCMessage) => {
          if (message.request_id === requestId && message.type === 'remote:progress') {
            onProgress(message.data as RemoteTransferProgress)
          }
        }
        backendService.on('remote:progress', progressHandler)
      }

      const cleanup = () => {
        backendService.off('remote:transfer', handler)
        backendService.off('error', handler)
        if (progressHandler) {
          backendService.off('remote:progress', progressHandler)
        }
      }

      const handler = (message: IPCMessage) => {
        if (message.request_id !== requestId) return

        if (message.type === 'remote:transfer') {
          cleanup()
          resolve(message.data as RemoteTransferResult)
        } else if (message.type === 'error') {
          cleanup()
          reject(new Error(message.data.error))
        }
      }

      backendService.on('remote:transfer', handler)
      backendService.on('error', handler)

      requestId = backendService.send({
        type: 'remote:transfer',
        data: {
          source_session_id: sourceSessionId,
          dest_session_id: destSessionId,
          source_path: sourcePath,
          dest_path: destPath
        }
      })
    })
  },

  bulkRemoteTransfer(
    sourceSessionId: string,
    destSessionId: string,
    sourcePaths: string[],
    destDir: string,
    onProgress?: (progress: RemoteTransferProgress) => void
  ): Promise<RemoteTransferResult[]> {
    return new Promise((resolve, reject) => {
      let requestId = ''
      let progressHandler: ((message: IPCMessage) => void) | null = null
      
      if (onProgress) {
        progressHandler = (message: IPCMessage) => {
          if (message.request_id === requestId && message.type === 'remote:progress') {
            onProgress(message.data as RemoteTransferProgress)
          }
        }
        backendService.on('remote:progress', progressHandler)
      }

      const cleanup = () => {
        backendService.off('bulk:remote:transfer', handler)
        backendService.off('error', handler)
        if (progressHandler) {
          backendService.off('remote:progress', progressHandler)
        }
      }

      const handler = (message: IPCMessage) => {
        if (message.request_id !== requestId) return

        if (message.type === 'bulk:remote:transfer') {
          cleanup()
          resolve(message.data as RemoteTransferResult[])
        } else if (message.type === 'error') {
          cleanup()
          reject(new Error(message.data.error))
        }
      }

      backendService.on('bulk:remote:transfer', handler)
      backendService.on('error', handler)

      requestId = backendService.send({
        type: 'bulk:remote:transfer',
        data: {
          source_session_id: sourceSessionId,
          dest_session_id: destSessionId,
          source_paths: sourcePaths,
          dest_dir: destDir
        }
      })
    })
  },

  cancelRemoteTransfer(transferId: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      let requestId = ''

      const handler = (message: IPCMessage) => {
        if (message.request_id !== requestId) return

        if (message.type === 'remote:cancel') {
          backendService.off('remote:cancel', handler)
          backendService.off('error', handler)
          resolve(message.data?.cancelled ?? false)
        } else if (message.type === 'error') {
          backendService.off('remote:cancel', handler)
          backendService.off('error', handler)
          reject(new Error(message.data.error))
        }
      }

      backendService.on('remote:cancel', handler)
      backendService.on('error', handler)

      requestId = backendService.send({
        type: 'remote:cancel',
        data: { transfer_id: transferId }
      })
    })
  }
}
