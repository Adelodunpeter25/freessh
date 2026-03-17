import { db } from '../db/schema'
import type { KnownHost } from '@/types'

export const knownHostService = {
  async getAll(): Promise<KnownHost[]> {
    const results = await db.getAllAsync('SELECT * FROM known_hosts')
    return (results as any[]).map((row) => ({
      ...row
    })) as KnownHost[]
  },

  async addHost(host: KnownHost): Promise<void> {
    await db.runAsync(
      'INSERT INTO known_hosts (id, hostname, port, fingerprint, publicKey) VALUES (?, ?, ?, ?, ?)',
      [host.id, host.hostname, host.port, host.fingerprint, host.publicKey]
    )
  },

  async delete(id: string): Promise<void> {
    await db.runAsync('DELETE FROM known_hosts WHERE id = ?', [id])
  },

  async clear(): Promise<void> {
    await db.runAsync('DELETE FROM known_hosts')
  }
}
