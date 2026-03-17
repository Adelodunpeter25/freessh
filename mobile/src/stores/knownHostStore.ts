import { create } from 'zustand'
import type { KnownHost } from '@/types'
import { knownHostService } from '../services/crud'

type KnownHostState = {
  knownHosts: KnownHost[]
  loading: boolean
  initialize: () => Promise<void>
  addKnownHost: (host: KnownHost) => Promise<void>
  removeKnownHost: (id: string) => Promise<void>
  clearKnownHosts: () => Promise<void>
}

export const useKnownHostStore = create<KnownHostState>((set) => ({
  knownHosts: [],
  loading: false,

  initialize: async () => {
    set({ loading: true })
    try {
      const knownHosts = await knownHostService.getAll()
      set({ knownHosts, loading: false })
    } catch (error) {
      console.error('Failed to load known hosts:', error)
      set({ loading: false })
    }
  },

  addKnownHost: async (host) => {
    await knownHostService.addHost(host)
    set((state) => ({ knownHosts: [...state.knownHosts, host] }))
  },

  removeKnownHost: async (id) => {
    await knownHostService.delete(id)
    set((state) => ({
      knownHosts: state.knownHosts.filter((item) => item.id !== id),
    }))
  },

  clearKnownHosts: async () => {
    await knownHostService.clear()
    set({ knownHosts: [] })
  },
}))
