import { create } from 'zustand'
import type { ConnectionConfig } from '@/types'
import { connectionService, keyService } from '../services/crud'
import { sshService } from '@/services'

type ConnectionState = {
  connections: ConnectionConfig[]
  loading: boolean
  connectingIds: Record<string, boolean>
  initialize: () => Promise<void>
  addConnection: (connection: ConnectionConfig) => Promise<void>
  duplicateConnection: (connection: ConnectionConfig) => Promise<ConnectionConfig>
  updateConnection: (connection: ConnectionConfig) => Promise<void>
  removeConnection: (id: string) => Promise<void>
  connect: (connection: ConnectionConfig) => Promise<void>
  connectSftp: (connection: ConnectionConfig) => Promise<void>
}

export const useConnectionStore = create<ConnectionState>((set, get) => ({
  connections: [],
  loading: false,
  connectingIds: {},

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

  duplicateConnection: async (connection) => {
    const copy = await connectionService.duplicate(connection)
    set((state) => ({ connections: [...state.connections, copy] }))
    return copy
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

  connect: async (connection) => {
    set((state) => ({
      connectingIds: { ...state.connectingIds, [connection.id]: true },
    }))
    console.log('[connect] start', connection.id, connection.name)
    const port = connection.port ?? 22
    let client
    try {
      if (connection.auth_method === 'password') {
        console.log('[connect] auth=password')
        if (!connection.password) {
          console.log('[connect] missing password')
          throw new Error('Missing password')
        }
        console.log('[connect] connectWithPassword', connection.host, port, connection.username)
        client = await sshService.connectWithPassword(
          connection.host,
          port,
          connection.username,
          connection.password
        )
      } else {
        console.log('[connect] auth=publickey')
        let privateKey = connection.private_key
        if (!privateKey && connection.key_id) {
          console.log('[connect] loading key by id', connection.key_id)
          const key = await keyService.getById(connection.key_id)
          privateKey = key?.private_key || ''
        }
        if (!privateKey) {
          console.log('[connect] missing private key')
          throw new Error('Missing private key')
        }
        console.log('[connect] connectWithKey', connection.host, port, connection.username)
        client = await sshService.connectWithKey(
          connection.host,
          port,
          connection.username,
          privateKey
        )
      }

      console.log('[connect] connected, disconnecting')
      sshService.disconnect(client)
      console.log('[connect] done')
    } finally {
      set((state) => {
        const next = { ...state.connectingIds }
        delete next[connection.id]
        return { connectingIds: next }
      })
    }
  },

  connectSftp: async (connection) => {
    set((state) => ({
      connectingIds: { ...state.connectingIds, [connection.id]: true },
    }))
    console.log('[connectSftp] start', connection.id, connection.name)
    const port = connection.port ?? 22
    let client
    try {
      if (connection.auth_method === 'password') {
        console.log('[connectSftp] auth=password')
        if (!connection.password) {
          console.log('[connectSftp] missing password')
          throw new Error('Missing password')
        }
        console.log('[connectSftp] connectWithPassword', connection.host, port, connection.username)
        client = await sshService.connectWithPassword(
          connection.host,
          port,
          connection.username,
          connection.password
        )
      } else {
        console.log('[connectSftp] auth=publickey')
        let privateKey = connection.private_key
        if (!privateKey && connection.key_id) {
          console.log('[connectSftp] loading key by id', connection.key_id)
          const key = await keyService.getById(connection.key_id)
          privateKey = key?.private_key || ''
        }
        if (!privateKey) {
          console.log('[connectSftp] missing private key')
          throw new Error('Missing private key')
        }
        console.log('[connectSftp] connectWithKey', connection.host, port, connection.username)
        client = await sshService.connectWithKey(
          connection.host,
          port,
          connection.username,
          privateKey
        )
      }

      console.log('[connectSftp] connected, starting sftp')
      await sshService.connectSftp(client)
      console.log('[connectSftp] sftp connected, disconnecting')
      sshService.disconnect(client)
      console.log('[connectSftp] done')
    } finally {
      set((state) => {
        const next = { ...state.connectingIds }
        delete next[connection.id]
        return { connectingIds: next }
      })
    }
  },
}))
