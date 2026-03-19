import { db } from '../db/schema'
import type { ConnectionConfig, SSHKey } from '@/types'
import { connectionService } from './connectionService'
import { sshService } from '@/services/ssh/sshService'

type ExportOptions = {
  password?: string
}

const shellQuote = (value: string): string => `'${value.replace(/'/g, `'\"'\"'`)}'`

const buildAuthorizedKeysInstallCommand = (publicKey: string): string => {
  const normalized = publicKey.trim()
  const quoted = shellQuote(normalized)

  return [
    'set -e',
    'umask 077',
    'mkdir -p ~/.ssh',
    'chmod 700 ~/.ssh',
    'touch ~/.ssh/authorized_keys',
    'chmod 600 ~/.ssh/authorized_keys',
    `grep -qxF ${quoted} ~/.ssh/authorized_keys || printf '%s\\n' ${quoted} >> ~/.ssh/authorized_keys`,
  ].join(' && ')
}

export const keyService = {
  async getAll(): Promise<SSHKey[]> {
    const results = await db.getAllAsync('SELECT * FROM ssh_keys')
    return (results as any[]).map((row) => ({
      ...row
    })) as SSHKey[]
  },

  async create(key: SSHKey & { private_key?: string; passphrase?: string }): Promise<void> {
    await db.runAsync(
      `INSERT INTO ssh_keys (id, name, algorithm, bits, publicKey, private_key, passphrase, createdAt) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        key.id,
        key.name,
        key.algorithm,
        key.bits || null,
        key.publicKey,
        key.private_key || null,
        key.passphrase || null,
        key.createdAt || new Date().toISOString(),
      ]
    )
  },

  async getById(id: string): Promise<(SSHKey & { private_key?: string; passphrase?: string }) | null> {
    const result = await db.getFirstAsync('SELECT * FROM ssh_keys WHERE id = ?', [id])
    return result as any || null
  },

  async update(key: SSHKey & { private_key?: string; passphrase?: string }): Promise<void> {
    await db.runAsync(
      `UPDATE ssh_keys SET name = ?, algorithm = ?, bits = ?, publicKey = ?, private_key = ?, passphrase = ?
       WHERE id = ?`,
      [
        key.name,
        key.algorithm,
        key.bits || null,
        key.publicKey,
        key.private_key || null,
        key.passphrase || null,
        key.id,
      ]
    )
  },

  async delete(id: string): Promise<void> {
    await db.runAsync('DELETE FROM ssh_keys WHERE id = ?', [id])
  },

  async exportToHost(
    keyId: string,
    connectionId: string,
    options: ExportOptions = {},
  ): Promise<ConnectionConfig> {
    const key = await this.getById(keyId)
    if (!key) {
      throw new Error('Key not found')
    }

    const connection = await connectionService.getById(connectionId)
    if (!connection) {
      throw new Error('Connection not found')
    }

    const port = connection.port ?? 22
    const installCommand = buildAuthorizedKeysInstallCommand(key.publicKey)

    let client: Awaited<ReturnType<typeof sshService.connectWithPassword>> | null = null
    try {
      if (connection.auth_method === 'password') {
        const password = options.password ?? connection.password
        if (!password) {
          throw new Error('Password is required to export this key to host')
        }

        client = await sshService.connectWithPassword(
          connection.host,
          port,
          connection.username,
          password,
        )
      } else {
        if (connection.private_key) {
          client = await sshService.connectWithKey(
            connection.host,
            port,
            connection.username,
            connection.private_key,
            connection.passphrase,
          )
        } else if (connection.key_id) {
          const authKey = await this.getById(connection.key_id)
          if (!authKey?.private_key) {
            throw new Error('Connection key is missing a private key')
          }

          client = await sshService.connectWithKey(
            connection.host,
            port,
            connection.username,
            authKey.private_key,
            connection.passphrase ?? authKey.passphrase,
          )
        } else {
          throw new Error('Connection has no credentials available for host export')
        }
      }

      await sshService.execute(client, installCommand)
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to install key on host: ${error.message}`)
      }
      throw new Error('Failed to install key on host')
    } finally {
      if (client) {
        sshService.disconnect(client)
      }
    }

    const updated: ConnectionConfig = {
      ...connection,
      auth_method: 'publickey',
      key_id: keyId,
      private_key: undefined,
      password: undefined,
    }

    await connectionService.update(updated)
    return updated
  },
}
