import { create } from 'zustand'

import type { ConnectionConfig } from '../types'

type ConnectionState = {
  connections: ConnectionConfig[]
  addConnection: (connection: ConnectionConfig) => void
  updateConnection: (connection: ConnectionConfig) => void
  removeConnection: (id: string) => void
}

const seedConnections: ConnectionConfig[] = [
  {
    id: 'conn-1',
    name: 'Production Box',
    host: 'prod.example.com',
    port: 22,
    username: 'root',
    auth_method: 'publickey',
    group: 'grp-1',
  },
  {
    id: 'conn-2',
    name: 'Staging',
    host: 'staging.example.com',
    port: 22,
    username: 'deploy',
    auth_method: 'password',
    group: 'grp-1',
  },
  {
    id: 'conn-3',
    name: 'Home Server',
    host: '192.168.1.10',
    port: 22,
    username: 'pi',
    auth_method: 'publickey',
    group: 'grp-2',
  },
]

export const useConnectionStore = create<ConnectionState>((set) => ({
  connections: seedConnections,
  addConnection: (connection) =>
    set((state) => ({ connections: [...state.connections, connection] })),
  updateConnection: (connection) =>
    set((state) => ({
      connections: state.connections.map((item) =>
        item.id === connection.id ? connection : item
      ),
    })),
  removeConnection: (id) =>
    set((state) => ({
      connections: state.connections.filter((item) => item.id !== id),
    })),
}))
