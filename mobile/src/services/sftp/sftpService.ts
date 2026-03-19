import { sshService, type SSHClientInstance } from '@/services/ssh/sshService'
import { ReconnectManager } from './reconnect'

function shellQuote(value: string): string {
  return `'${value.replace(/'/g, `'\"'\"'`)}'`
}

function toNativeLocalPath(localPath: string): string {
  return localPath.startsWith('file://') ? decodeURIComponent(localPath.replace('file://', '')) : localPath
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

async function withReconnect<T>(
  client: SSHClientInstance,
  operation: () => Promise<T>,
): Promise<T> {
  try {
    return await operation()
  } catch (error) {
    const reconnectManager = getReconnectManager(client)
    try {
      await client.connectSFTP()
      reconnectManager.reset()
      return await operation()
    } catch (reconnectError) {
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
    return withReconnect(client, () => client.sftpLs(path))
  },

  mkdir(client: SSHClientInstance, path: string) {
    return withReconnect(client, () => client.sftpMkdir(path))
  },

  rename(client: SSHClientInstance, oldPath: string, newPath: string) {
    return withReconnect(client, () => client.sftpRename(oldPath, newPath))
  },

  removeFile(client: SSHClientInstance, path: string) {
    return withReconnect(client, () => client.sftpRm(path))
  },

  removeDirectory(client: SSHClientInstance, path: string) {
    return withReconnect(client, () => client.sftpRmdir(path))
  },

  uploadFile(client: SSHClientInstance, localFilePath: string, remoteFilePath: string) {
    return withReconnect(client, () => client.sftpUpload(toNativeLocalPath(localFilePath), remoteFilePath))
  },

  downloadFile(client: SSHClientInstance, remoteFilePath: string, localFilePath: string) {
    return withReconnect(client, () => client.sftpDownload(remoteFilePath, toNativeLocalPath(localFilePath)))
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
