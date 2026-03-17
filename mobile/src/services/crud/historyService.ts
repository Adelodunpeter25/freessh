import { db } from '../db/schema'
import type { HistoryEntry } from '@/types'

export const historyService = {
  async getAll(): Promise<HistoryEntry[]> {
    const results = await db.getAllAsync('SELECT * FROM history')
    return (results as any[]).map((row) => ({
      id: row.id,
      command: row.command
    }))
  },

  async add(command: string, connectionId?: string): Promise<void> {
    const id = Date.now().toString()
    await db.runAsync(
      'INSERT INTO history (id, command, connection_id) VALUES (?, ?, ?)',
      [id, command, connectionId || null]
    )
  },

  async clear(): Promise<void> {
    await db.runAsync('DELETE FROM history')
  },

  async delete(id: string): Promise<void> {
    await db.runAsync('DELETE FROM history WHERE id = ?', [id])
  },

  async getRecent(limit: number = 20): Promise<HistoryEntry[]> {
    const results = await db.getAllAsync('SELECT * FROM history ORDER BY id DESC LIMIT ?', [limit])
    return (results as any[]).map((row) => ({
      id: row.id,
      command: row.command
    }))
  }
}
