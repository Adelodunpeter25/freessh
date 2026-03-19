import { sshService, type SSHClientInstance } from '@/services/ssh/sshService'

function shellQuote(value: string): string {
  return `'${value.replace(/'/g, `'\"'\"'`)}'`
}

export const sftpService = {
  connect(client: SSHClientInstance) {
    return sshService.connectSftp(client)
  },

  list(client: SSHClientInstance, path: string) {
    return sshService.sftpLs(client, path)
  },

  mkdir(client: SSHClientInstance, path: string) {
    return sshService.sftpMkdir(client, path)
  },

  rename(client: SSHClientInstance, oldPath: string, newPath: string) {
    return sshService.sftpRename(client, oldPath, newPath)
  },

  removeFile(client: SSHClientInstance, path: string) {
    return sshService.sftpRm(client, path)
  },

  removeDirectory(client: SSHClientInstance, path: string) {
    return sshService.sftpRmdir(client, path)
  },

  uploadFile(client: SSHClientInstance, localFilePath: string, remoteFilePath: string) {
    return sshService.sftpUpload(client, localFilePath, remoteFilePath)
  },

  downloadFile(client: SSHClientInstance, remoteFilePath: string, localFilePath: string) {
    return sshService.sftpDownload(client, remoteFilePath, localFilePath)
  },

  async copyRemoteEntries(client: SSHClientInstance, sourcePaths: string[], destinationDirectory: string) {
    for (const sourcePath of sourcePaths) {
      const command = `cp -R -- ${shellQuote(sourcePath)} ${shellQuote(destinationDirectory)}`
      await sshService.execute(client, command)
    }
  },
}

