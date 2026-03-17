import { create } from 'zustand'
import type { ConnectionConfig } from '@/types'
import { connectionService } from '../services/crud'

type ConnectionState = {
  connections: ConnectionConfig[]
  loading: boolean
  initialize: () => Promise<void>
  addConnection: (connection: ConnectionConfig) => Promise<void>
  updateConnection: (connection: ConnectionConfig) => Promise<void>
  removeConnection: (id: string) => Promise<void>
}

export const useConnectionStore = create<ConnectionState>((set, get) => ({
  connections: [],
  loading: false,

  initialize: async () => {
    set({ loading: true })
    try {
      const connections = await connectionService.getAll()
      set({ connections, loading: false })
    } catch (error) {
      console.error('Failed to load connections:', error)
      set({ loading: false })
    }
  },

  addConnection: async (connection) => {
    await connectionService.create(connection)
    set((state) => ({ connections: [...state.connections, connection] }))
  },

  updateConnection: async (connection) => {
    await connectionService.update(connection)
    set((state) => ({
      connections: state.connections.map((item) =>
        item.id === connection.id ? connection : item
      ),
    }))
  },

  removeConnection: async (id) => {
    await connectionService.delete(id)
    set((state) => ({
      connections: state.connections.filter((item) => item.id !== id),
    }))
  },
}))
