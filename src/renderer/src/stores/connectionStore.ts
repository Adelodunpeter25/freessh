import { create } from 'zustand'
import { ConnectionConfig } from '../types'

interface ConnectionStore {
  connections: ConnectionConfig[]
  selectedConnection: ConnectionConfig | null
  
  setConnections: (connections: ConnectionConfig[]) => void
  addConnection: (connection: ConnectionConfig) => void
  removeConnection: (id: string) => void
  updateConnection: (id: string, updates: Partial<ConnectionConfig>) => void
  setSelectedConnection: (connection: ConnectionConfig | null) => void
  getConnection: (id: string) => ConnectionConfig | undefined
}

export const useConnectionStore = create<ConnectionStore>((set, get) => ({
  connections: [],
  selectedConnection: null,

  setConnections: (connections) => {
    set({ connections })
  },

  addConnection: (connection) => {
    set((state) => ({
      connections: [...state.connections, connection]
    }))
  },

  removeConnection: (id) => {
    set((state) => ({
      connections: state.connections.filter((conn) => conn.id !== id)
    }))
  },

  updateConnection: (id, updates) => {
    set((state) => ({
      connections: state.connections.map((conn) =>
        conn.id === id ? { ...conn, ...updates } : conn
      )
    }))
  },

  setSelectedConnection: (connection) => {
    set({ selectedConnection: connection })
  },

  getConnection: (id) => {
    return get().connections.find((conn) => conn.id === id)
  }
}))
