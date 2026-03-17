import { db } from '../db/schema'
import type { PortForwardConfig } from '../../types'

export const portforwardService = {
  async getAll(): Promise<PortForwardConfig[]> {
    const results = await db.getAllAsync('SELECT * FROM port_forwards')
    return (results as any[]).map((row) => ({
      ...row,
      auto_start: !!row.auto_start,
    }))
  },

  async create(config: PortForwardConfig): Promise<void> {
    await db.runAsync(
      `INSERT INTO port_forwards (id, name, connection_id, type, local_port, remote_host, remote_port, binding_address, auto_start) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        config.id,
        config.name,
        config.connection_id,
        config.type,
        config.local_port,
        config.remote_host || null,
        config.remote_port,
        config.binding_address || null,
        config.auto_start ? 1 : 0,
      ]
    )
  },

  async update(config: PortForwardConfig): Promise<void> {
    await db.runAsync(
      `UPDATE port_forwards SET name = ?, connection_id = ?, type = ?, local_port = ?, remote_host = ?, remote_port = ?, binding_address = ?, auto_start = ?
       WHERE id = ?`,
      [
        config.name,
        config.connection_id,
        config.type,
        config.local_port,
        config.remote_host || null,
        config.remote_port,
        config.binding_address || null,
        config.auto_start ? 1 : 0,
        config.id,
      ]
    )
  },

  async delete(id: string): Promise<void> {
    await db.runAsync('DELETE FROM port_forwards WHERE id = ?', [id])
  },

  async getByConnection(connectionId: string): Promise<PortForwardConfig[]> {
    const results = await db.getAllAsync('SELECT * FROM port_forwards WHERE connection_id = ?', [connectionId])
    return (results as any[]).map((row) => ({
      ...row,
      auto_start: !!row.auto_start,
    }))
  },
}
