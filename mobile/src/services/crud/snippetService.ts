import { db } from '../db/schema'
import type { Snippet } from '../../types'

export const snippetService = {
  async getAll(): Promise<Snippet[]> {
    const results = await db.getAllAsync('SELECT * FROM snippets ORDER BY name ASC')
    return (results as any[]).map((row) => ({
      ...row,
      created_at: row.created_at || new Date().toISOString(),
    }))
  },

  async create(snippet: Snippet): Promise<void> {
    await db.runAsync(
      'INSERT INTO snippets (id, name, command, created_at) VALUES (?, ?, ?, ?)',
      [
        snippet.id,
        snippet.name,
        snippet.command,
        snippet.created_at || new Date().toISOString()
      ]
    )
  },

  async update(snippet: Snippet): Promise<void> {
    await db.runAsync(
      'UPDATE snippets SET name = ?, command = ? WHERE id = ?',
      [snippet.name, snippet.command, snippet.id]
    )
  },

  async delete(id: string): Promise<void> {
    await db.runAsync('DELETE FROM snippets WHERE id = ?', [id])
  },
}
