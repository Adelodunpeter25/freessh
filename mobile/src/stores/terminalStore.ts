import { create } from 'zustand'
import type { ConnectionConfig } from '@/types'
import { sshService } from '@/services'
import { keyService } from '@/services/crud'

export type TerminalSession = {
  id: string
  connectionId: string
  name: string
  status: 'connecting' | 'connected' | 'error' | 'closed'
}

type OutputListener = (data: string) => void

const clientMap = new Map<string, ReturnType<typeof sshService.connectWithPassword>>()
const outputListeners = new Map<string, Set<OutputListener>>()

type TerminalState = {
  sessions: TerminalSession[]
  activeSessionId: string | null
  connectingByConnectionId: Record<string, boolean>
  openSession: (connection: ConnectionConfig) => Promise<string>
  setActiveSession: (id: string) => void
  closeSession: (id: string) => Promise<void>
  sendInput: (id: string, data: string) => Promise<void>
  subscribeOutput: (id: string, listener: OutputListener) => () => void
}

const makeId = () => `sess-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

export const useTerminalStore = create<TerminalState>((set, get) => ({
  sessions: [],
  activeSessionId: null,
  connectingByConnectionId: {},

  openSession: async (connection) => {
    const id = makeId()
    set((state) => ({
      sessions: [
        ...state.sessions,
        { id, connectionId: connection.id, name: connection.name, status: 'connecting' },
      ],
      activeSessionId: id,
      connectingByConnectionId: {
        ...state.connectingByConnectionId,
        [connection.id]: true,
      },
    }))

    const port = connection.port ?? 22
    let client
    try {
      if (connection.auth_method === 'password') {
        if (!connection.password) {
          throw new Error('Missing password')
        }
        client = await sshService.connectWithPassword(
          connection.host,
          port,
          connection.username,
          connection.password
        )
      } else {
        let privateKey = connection.private_key
        if (!privateKey && connection.key_id) {
          const key = await keyService.getById(connection.key_id)
          privateKey = key?.private_key || ''
        }
        if (!privateKey) {
          throw new Error('Missing private key')
        }
        client = await sshService.connectWithKey(
          connection.host,
          port,
          connection.username,
          privateKey
        )
      }

      clientMap.set(id, client)
      sshService.onShell(client, (data) => {
        const listeners = outputListeners.get(id)
        if (!listeners) return
        listeners.forEach((fn) => fn(data))
      })

      await sshService.startShell(client, 'xterm-256color')

      set((state) => ({
        sessions: state.sessions.map((s) =>
          s.id === id ? { ...s, status: 'connected' } : s
        ),
        connectingByConnectionId: {
          ...state.connectingByConnectionId,
          [connection.id]: false,
        },
      }))

      return id
    } catch (error) {
      set((state) => ({
        sessions: state.sessions.map((s) =>
          s.id === id ? { ...s, status: 'error' } : s
        ),
        connectingByConnectionId: {
          ...state.connectingByConnectionId,
          [connection.id]: false,
        },
      }))
      throw error
    }
  },

  setActiveSession: (id) => {
    set({ activeSessionId: id })
  },

  closeSession: async (id) => {
    const client = clientMap.get(id)
    if (client) {
      try {
        sshService.closeShell(client)
        sshService.disconnect(client)
      } catch {
        // ignore
      }
      clientMap.delete(id)
    }
    outputListeners.delete(id)
    set((state) => ({
      sessions: state.sessions.filter((s) => s.id !== id),
      activeSessionId: state.activeSessionId === id ? null : state.activeSessionId,
    }))
  },

  sendInput: async (id, data) => {
    const client = clientMap.get(id)
    if (!client) return
    await sshService.writeToShell(client, data)
  },

  subscribeOutput: (id, listener) => {
    const setForId = outputListeners.get(id) ?? new Set()
    setForId.add(listener)
    outputListeners.set(id, setForId)
    return () => {
      const current = outputListeners.get(id)
      if (!current) return
      current.delete(listener)
      if (current.size === 0) {
        outputListeners.delete(id)
      }
    }
  },
}))
