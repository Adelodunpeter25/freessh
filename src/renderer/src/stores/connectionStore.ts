import { create } from 'zustand'
import { ConnectionConfig } from '../types'
import { connectionService } from '@/services/ipc/connection'

let loadConnectionsPromise: Promise<ConnectionConfig[]> | null = null

interface ConnectionStore {
  connections: ConnectionConfig[]
  selectedConnection: ConnectionConfig | null
  hasLoadedConnections: boolean
  
  setConnections: (connections: ConnectionConfig[]) => void
  addConnection: (connection: ConnectionConfig) => void
  removeConnection: (id: string) => void
  updateConnection: (id: string, updates: Partial<ConnectionConfig>) => void
  setSelectedConnection: (connection: ConnectionConfig | null) => void
  getConnection: (id: string) => ConnectionConfig | undefined
  ensureConnectionsLoaded: () => Promise<ConnectionConfig[]>
}

export const useConnectionStore = create<ConnectionStore>((set, get) => ({
  connections: [],
  selectedConnection: null,
  hasLoadedConnections: false,

  setConnections: (connections) => {
    set({ connections, hasLoadedConnections: true })
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
  },

  ensureConnectionsLoaded: async () => {
    if (get().hasLoadedConnections) {
      return get().connections
    }

    if (loadConnectionsPromise) {
      return loadConnectionsPromise
    }

    loadConnectionsPromise = connectionService
      .list()
      .then((connections) => {
        set({ connections, hasLoadedConnections: true })
        return connections
      })
      .finally(() => {
        loadConnectionsPromise = null
      })

    return loadConnectionsPromise
  },
}))
