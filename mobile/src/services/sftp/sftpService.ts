import { sshService, type SSHClientInstance } from '@/services/ssh/sshService'
import { ReconnectManager } from './reconnect'

function shellQuote(value: string): string {
  return `'${value.replace(/'/g, `'\"'\"'`)}'`
}

function toNativeLocalPath(localPath: string): string {
  return localPath.startsWith('file://') ? decodeURIComponent(localPath.replace('file://', '')) : localPath
}

function toFileUriPath(localPath: string): string {
  if (localPath.startsWith('file://')) return decodeURIComponent(localPath)
  return `file://${localPath}`
}

function uniqueCandidates(paths: string[]): string[] {
  const seen = new Set<string>()
  const result: string[] = []
  for (const path of paths) {
    if (seen.has(path)) continue
    seen.add(path)
    result.push(path)
  }
  return result
}

const reconnectManagers = new WeakMap<SSHClientInstance, ReconnectManager>()

function getReconnectManager(client: SSHClientInstance): ReconnectManager {
  const existing = reconnectManagers.get(client)
  if (existing) return existing
  const manager = new ReconnectManager(
    () => client.connectSFTP(),
    () => console.log('[SFTP] Max reconnect attempts reached'),
  )
  reconnectManagers.set(client, manager)
  return manager
}

function isConnectionError(error: unknown): boolean {
  if (!error) return false
  const message = (error instanceof Error ? error.message : String(error)).toLowerCase()
  return (
    message.includes('not connected') ||
    message.includes('connection lost') ||
    message.includes('socket closed') ||
    message.includes('broken pipe') ||
    message.includes('eof') ||
    message.includes('connection timed out') ||
    message.includes('session is closed')
  )
}

async function withReconnect<T>(
  label: string,
  client: SSHClientInstance,
  operation: () => Promise<T>,
): Promise<T> {
  try {
    return await operation()
  } catch (error) {
    if (!isConnectionError(error)) {
      console.error(`[SFTP] ${label} failed with non-connection error`, error)
      throw error
    }

    console.warn(`[SFTP] ${label} failed with connection error, attempting reconnect`, error)
    const reconnectManager = getReconnectManager(client)
    try {
      await client.connectSFTP()
      reconnectManager.reset()
      console.log(`[SFTP] ${label} reconnect succeeded, retrying`)
      return await operation()
    } catch (reconnectError) {
      console.error(`[SFTP] ${label} reconnect retry failed`, reconnectError)
      void reconnectManager.attemptReconnect()
      throw reconnectError ?? error
    }
  }
}

export const sftpService = {
  async connect(client: SSHClientInstance) {
    await client.connectSFTP()
    getReconnectManager(client).reset()
  },

  list(client: SSHClientInstance, path: string) {
    return withReconnect(`list:${path}`, client, () => client.sftpLs(path))
  },

  mkdir(client: SSHClientInstance, path: string) {
    return withReconnect(`mkdir:${path}`, client, () => client.sftpMkdir(path))
  },

  rename(client: SSHClientInstance, oldPath: string, newPath: string) {
    return withReconnect(`rename:${oldPath}->${newPath}`, client, () => client.sftpRename(oldPath, newPath))
  },

  removeFile(client: SSHClientInstance, path: string) {
    return withReconnect(`rm:${path}`, client, () => client.sftpRm(path))
  },

  removeDirectory(client: SSHClientInstance, path: string) {
    return withReconnect(`rmdir:${path}`, client, () => client.sftpRmdir(path))
  },

  uploadFile(client: SSHClientInstance, localFilePath: string, remoteFilePath: string) {
    const nativeLocalPath = toNativeLocalPath(localFilePath)
    const fileUriPath = toFileUriPath(localFilePath)
    const candidates = uniqueCandidates([localFilePath, fileUriPath, nativeLocalPath])
    console.log('[SFTP] uploadFile', {
      localFilePath,
      fileUriPath,
      nativeLocalPath,
      candidates,
      remoteFilePath,
    })
    return withReconnect(`upload:${nativeLocalPath}->${remoteFilePath}`, client, async () => {
      let lastError: unknown
      for (const candidate of candidates) {
        try {
          return await client.sftpUpload(candidate, remoteFilePath)
        } catch (error) {
          lastError = error
          console.error('[SFTP] uploadFile candidate failed', { candidate, remoteFilePath, error })
        }
      }
      throw lastError instanceof Error ? lastError : new Error('Failed to upload with all local path forms')
    })
  },

  downloadFile(client: SSHClientInstance, remoteFilePath: string, localFilePath: string) {
    const nativeLocalPath = toNativeLocalPath(localFilePath)
    const fileUriPath = toFileUriPath(localFilePath)
    const candidates = uniqueCandidates([localFilePath, fileUriPath, nativeLocalPath])
    console.log('[SFTP] downloadFile', {
      remoteFilePath,
      localFilePath,
      fileUriPath,
      nativeLocalPath,
      candidates,
    })
    return withReconnect(`download:${remoteFilePath}->${nativeLocalPath}`, client, async () => {
      let lastError: unknown
      for (const candidate of candidates) {
        try {
          return await client.sftpDownload(remoteFilePath, candidate)
        } catch (error) {
          lastError = error
          console.error('[SFTP] downloadFile candidate failed', { remoteFilePath, candidate, error })
        }
      }
      throw lastError instanceof Error ? lastError : new Error('Failed to download with all local path forms')
    })
  },

  async copyRemoteEntries(client: SSHClientInstance, sourcePaths: string[], destinationDirectory: string) {
    for (const sourcePath of sourcePaths) {
      const command = `cp -R -- ${shellQuote(sourcePath)} ${shellQuote(destinationDirectory)}`
      await sshService.execute(client, command)
    }
  },

  stopReconnect(client: SSHClientInstance) {
    const reconnectManager = reconnectManagers.get(client)
    reconnectManager?.stop()
    reconnectManagers.delete(client)
  },
}
