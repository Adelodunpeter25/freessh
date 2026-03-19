import SSHClient from '@dylankenneally/react-native-ssh-sftp'
import type { ConnectionConfig } from '@/types'

export type SSHClientInstance = Awaited<ReturnType<typeof SSHClient.connectWithPassword>>

type ConnectOptions = {
  password?: string
  privateKey?: string
  passphrase?: string
}

export const sshService = {
  async connectWithPassword(host: string, port: number, username: string, password: string) {
    return SSHClient.connectWithPassword(host, port, username, password)
  },

  async connectWithKey(host: string, port: number, username: string, privateKey: string, passphrase?: string) {
    return SSHClient.connectWithKey(host, port, username, privateKey, passphrase)
  },

  async connect(connection: ConnectionConfig, options: ConnectOptions = {}) {
    const port = connection.port ?? 22
    if (connection.auth_method === 'password') {
      const password = options.password ?? connection.password ?? ''
      return SSHClient.connectWithPassword(connection.host, port, connection.username, password)
    }

    const privateKey = options.privateKey ?? connection.private_key ?? ''
    const passphrase = options.passphrase
    return SSHClient.connectWithKey(connection.host, port, connection.username, privateKey, passphrase)
  },

  disconnect(client: SSHClientInstance) {
    client.disconnect()
  },

  execute(client: SSHClientInstance, command: string) {
    return client.execute(command)
  },

  startShell(client: SSHClientInstance, ptyType: string = 'vanilla') {
    return client.startShell(ptyType)
  },

  onShell(client: SSHClientInstance, handler: (event: string) => void) {
    client.on('Shell', handler)
  },

  writeToShell(client: SSHClientInstance, input: string) {
    return client.writeToShell(input)
  },

  closeShell(client: SSHClientInstance) {
    client.closeShell()
  },
}
