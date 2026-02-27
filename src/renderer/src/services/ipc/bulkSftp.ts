import { backendService } from './backend'
import { IPCMessage } from '../../types'

export interface BulkResult {
  path: string
  success: boolean
  error?: string
}

export interface BulkProgress {
  total_items: number
  completed_items: number
  failed_items: number
  current_item: string
}

export const bulkSftpService = {
  bulkDownload(
    sessionId: string,
    remotePaths: string[],
    localBaseDir: string,
    onProgress?: (progress: BulkProgress) => void
  ): Promise<BulkResult[]> {
    return new Promise((resolve, reject) => {
      let requestId = ''
      let progressHandler: ((message: IPCMessage) => void) | null = null
      
      if (onProgress) {
        progressHandler = (message: IPCMessage) => {
          if (
            message.request_id === requestId &&
            message.session_id === sessionId &&
            message.type === 'bulk:progress'
          ) {
            onProgress(message.data as BulkProgress)
          }
        }
        backendService.on('bulk:progress', progressHandler)
      }

      const cleanup = () => {
        backendService.off('bulk:download', handler)
        backendService.off('error', handler)
        if (progressHandler) {
          backendService.off('bulk:progress', progressHandler)
        }
      }

      const handler = (message: IPCMessage) => {
        if (message.request_id !== requestId) return

        if (message.session_id === sessionId && message.type === 'bulk:download') {
          cleanup()
          resolve(message.data as BulkResult[])
        } else if (message.type === 'error' && message.session_id === sessionId) {
          cleanup()
          reject(new Error(message.data.error))
        }
      }

      backendService.on('bulk:download', handler)
      backendService.on('error', handler)

      requestId = backendService.send({
        type: 'bulk:download',
        session_id: sessionId,
        data: {
          remote_paths: remotePaths,
          local_base_dir: localBaseDir
        }
      })
    })
  },

  bulkUpload(
    sessionId: string,
    localPaths: string[],
    remoteBaseDir: string,
    onProgress?: (progress: BulkProgress) => void
  ): Promise<BulkResult[]> {
    return new Promise((resolve, reject) => {
      let requestId = ''
      let progressHandler: ((message: IPCMessage) => void) | null = null
      
      if (onProgress) {
        progressHandler = (message: IPCMessage) => {
          if (
            message.request_id === requestId &&
            message.session_id === sessionId &&
            message.type === 'bulk:progress'
          ) {
            onProgress(message.data as BulkProgress)
          }
        }
        backendService.on('bulk:progress', progressHandler)
      }

      const cleanup = () => {
        backendService.off('bulk:upload', handler)
        backendService.off('error', handler)
        if (progressHandler) {
          backendService.off('bulk:progress', progressHandler)
        }
      }

      const handler = (message: IPCMessage) => {
        if (message.request_id !== requestId) return

        if (message.session_id === sessionId && message.type === 'bulk:upload') {
          cleanup()
          resolve(message.data as BulkResult[])
        } else if (message.type === 'error' && message.session_id === sessionId) {
          cleanup()
          reject(new Error(message.data.error))
        }
      }

      backendService.on('bulk:upload', handler)
      backendService.on('error', handler)

      requestId = backendService.send({
        type: 'bulk:upload',
        session_id: sessionId,
        data: {
          local_paths: localPaths,
          remote_base_dir: remoteBaseDir
        }
      })
    })
  },

  bulkDelete(
    sessionId: string,
    remotePaths: string[],
    onProgress?: (progress: BulkProgress) => void
  ): Promise<BulkResult[]> {
    return new Promise((resolve, reject) => {
      let requestId = ''
      let progressHandler: ((message: IPCMessage) => void) | null = null

      if (onProgress) {
        progressHandler = (message: IPCMessage) => {
          if (
            message.request_id === requestId &&
            message.session_id === sessionId &&
            message.type === 'bulk:progress'
          ) {
            onProgress(message.data as BulkProgress)
          }
        }
        backendService.on('bulk:progress', progressHandler)
      }

      const cleanup = () => {
        backendService.off('bulk:delete', handler)
        backendService.off('error', handler)
        if (progressHandler) {
          backendService.off('bulk:progress', progressHandler)
        }
      }

      const handler = (message: IPCMessage) => {
        if (message.request_id !== requestId) return

        if (message.session_id === sessionId && message.type === 'bulk:delete') {
          cleanup()
          resolve(message.data as BulkResult[])
        } else if (message.type === 'error') {
          cleanup()
          reject(new Error(message.data.error))
        }
      }

      backendService.on('bulk:delete', handler)
      backendService.on('error', handler)

      requestId = backendService.send({
        type: 'bulk:delete',
        session_id: sessionId,
        data: {
          remote_paths: remotePaths
        }
      })
    })
  }
}
