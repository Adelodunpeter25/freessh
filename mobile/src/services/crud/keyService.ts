import { db } from '../db/schema'
import type { ConnectionConfig, SSHKey } from '@/types'
import { connectionService } from './connectionService'

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

  async exportToHost(keyId: string, connectionId: string): Promise<ConnectionConfig> {
    const key = await this.getById(keyId)
    if (!key) {
      throw new Error('Key not found')
    }

    const connection = await connectionService.getById(connectionId)
    if (!connection) {
      throw new Error('Connection not found')
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
