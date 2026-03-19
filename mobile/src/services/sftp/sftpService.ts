import { sshService, type SSHClientInstance } from '@/services/ssh/sshService'

function shellQuote(value: string): string {
  return `'${value.replace(/'/g, `'\"'\"'`)}'`
}

export const sftpService = {
  connect(client: SSHClientInstance) {
    return client.connectSFTP()
  },

  list(client: SSHClientInstance, path: string) {
    return client.sftpLs(path)
  },

  mkdir(client: SSHClientInstance, path: string) {
    return client.sftpMkdir(path)
  },

  rename(client: SSHClientInstance, oldPath: string, newPath: string) {
    return client.sftpRename(oldPath, newPath)
  },

  removeFile(client: SSHClientInstance, path: string) {
    return client.sftpRm(path)
  },

  removeDirectory(client: SSHClientInstance, path: string) {
    return client.sftpRmdir(path)
  },

  uploadFile(client: SSHClientInstance, localFilePath: string, remoteFilePath: string) {
    return client.sftpUpload(localFilePath, remoteFilePath)
  },

  downloadFile(client: SSHClientInstance, remoteFilePath: string, localFilePath: string) {
    return client.sftpDownload(remoteFilePath, localFilePath)
  },

  async copyRemoteEntries(client: SSHClientInstance, sourcePaths: string[], destinationDirectory: string) {
    for (const sourcePath of sourcePaths) {
      const command = `cp -R -- ${shellQuote(sourcePath)} ${shellQuote(destinationDirectory)}`
      await sshService.execute(client, command)
    }
  },
}
