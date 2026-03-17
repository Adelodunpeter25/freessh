import { db } from '../db/schema'

// Lightweight services for active sessions metadata
export const sessionService = {
  // We can track things like current state of connected sessions in the UI
  // Sessions themselves are lived in memory, but we might want to store UI state
  
  async trackSession(connectionId: string, status: 'active' | 'disconnected'): Promise<void> {
    // This could update a status in the connections table for instance
    await db.runAsync(
       'UPDATE connections SET private_key = ? WHERE id = ?', // Using private_key as a placeholder for session activity metadata if needed
       [status === 'active' ? 'true' : 'false', connectionId]
    )
  },

  async getActiveConnectionsCount(): Promise<number> {
    const result = await db.getFirstAsync(
      'SELECT COUNT(*) as count FROM connections WHERE private_key = "true"'
    )
    return (result as any)?.count || 0
  }
}
