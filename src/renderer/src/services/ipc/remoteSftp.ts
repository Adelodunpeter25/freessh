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
      let progressHandler: ((message: IPCMessage) => void) | null = null
      
      if (onProgress) {
        progressHandler = (message: IPCMessage) => {
          if (message.type === 'remote:progress') {
            onProgress(message.data as RemoteTransferProgress)
          }
        }
        backendService.on('remote:progress', progressHandler)
      }

      const cleanup = () => {
        backendService.off('remote:transfer')
        backendService.off('error')
        if (progressHandler) {
          backendService.off('remote:progress')
        }
      }

      const handler = (message: IPCMessage) => {
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

      backendService.send({
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
      let progressHandler: ((message: IPCMessage) => void) | null = null
      
      if (onProgress) {
        progressHandler = (message: IPCMessage) => {
          if (message.type === 'remote:progress') {
            onProgress(message.data as RemoteTransferProgress)
          }
        }
        backendService.on('remote:progress', progressHandler)
      }

      const cleanup = () => {
        backendService.off('bulk:remote:transfer')
        backendService.off('error')
        if (progressHandler) {
          backendService.off('remote:progress')
        }
      }

      const handler = (message: IPCMessage) => {
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

      backendService.send({
        type: 'bulk:remote:transfer',
        data: {
          source_session_id: sourceSessionId,
          dest_session_id: destSessionId,
          source_paths: sourcePaths,
          dest_dir: destDir
        }
      })
    })
  }
}
