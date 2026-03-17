import { db } from '../db/schema'
import type { LogEntry } from '../../types'

export const logService = {
  async getAll(): Promise<LogEntry[]> {
    const results = await db.getAllAsync('SELECT * FROM logs ORDER BY timestamp DESC')
    return (results as any[]).map((row) => ({
      filename: row.filename,
      connection_name: row.connection_name,
      timestamp: row.timestamp,
      size: row.size || 0,
      path: row.path
    }))
  },

  async addEntry(entry: LogEntry): Promise<void> {
    const id = Date.now().toString()
    await db.runAsync(
      'INSERT INTO logs (id, filename, connection_name, timestamp, size, path) VALUES (?, ?, ?, ?, ?, ?)',
      [
        id,
        entry.filename,
        entry.connection_name,
        entry.timestamp || new Date().toISOString(),
        entry.size || 0,
        entry.path
      ]
    )
  },

  async delete(filename: string): Promise<void> {
    await db.runAsync('DELETE FROM logs WHERE filename = ?', [filename])
  },

  async clear(): Promise<void> {
    await db.runAsync('DELETE FROM logs')
  }
}
