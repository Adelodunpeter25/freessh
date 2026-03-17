import { db } from '../db/schema'
import type { Group } from '@/types'

export const groupService = {
  async getAll(): Promise<Group[]> {
    const results = await db.getAllAsync('SELECT * FROM groups order by name asc')
    return (results as any[]).map((row) => ({
      ...row,
      connection_count: row.connection_count || 0,
      created_at: row.created_at || new Date().toISOString(),
    }))
  },

  async create(group: Group): Promise<void> {
    await db.runAsync(
      'INSERT INTO groups (id, name, connection_count, created_at) VALUES (?, ?, ?, ?)',
      [
        group.id,
        group.name,
        group.connection_count || 0,
        group.created_at || new Date().toISOString()
      ]
    )
  },

  async update(group: Group): Promise<void> {
    await db.runAsync(
      'UPDATE groups SET name = ?, connection_count = ? WHERE id = ?',
      [group.name, group.connection_count || 0, group.id]
    )
  },

  async delete(id: string): Promise<void> {
    await db.runAsync('DELETE FROM groups WHERE id = ?', [id])
  },

  async incrementConnectionCount(id: string): Promise<void> {
    await db.runAsync(
      'UPDATE groups SET connection_count = connection_count + 1 WHERE id = ?',
      [id]
    )
  },

  async decrementConnectionCount(id: string): Promise<void> {
    await db.runAsync(
      'UPDATE groups SET connection_count = MAX(0, connection_count - 1) WHERE id = ?',
      [id]
    )
  },
}
