import { create } from 'zustand'
import { Session, ConnectionConfig } from '../types'

interface SessionWithConnection {
  session: Session
  connection: ConnectionConfig
}

interface SessionStore {
  sessions: Map<string, SessionWithConnection>
  
  addSession: (session: Session, connection: ConnectionConfig) => void
  removeSession: (sessionId: string) => void
  updateSession: (sessionId: string, updates: Partial<Session>) => void
  getSession: (sessionId: string) => SessionWithConnection | undefined
  getAllSessions: () => SessionWithConnection[]
}

export const useSessionStore = create<SessionStore>((set, get) => ({
  sessions: new Map(),

  addSession: (session, connection) => {
    set((state) => {
      const newSessions = new Map(state.sessions)
      newSessions.set(session.id, { session, connection })
      return { sessions: newSessions }
    })
  },

  removeSession: (sessionId) => {
    set((state) => {
      const newSessions = new Map(state.sessions)
      newSessions.delete(sessionId)
      return { sessions: newSessions }
    })
  },

  updateSession: (sessionId, updates) => {
    set((state) => {
      const item = state.sessions.get(sessionId)
      if (!item) return state

      const newSessions = new Map(state.sessions)
      newSessions.set(sessionId, { 
        ...item, 
        session: { ...item.session, ...updates }
      })
      return { sessions: newSessions }
    })
  },

  getSession: (sessionId) => {
    return get().sessions.get(sessionId)
  },

  getAllSessions: () => {
    return Array.from(get().sessions.values())
  }
}))
