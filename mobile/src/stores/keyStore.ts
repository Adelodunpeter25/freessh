import { create } from 'zustand'
import type { SSHKey } from '@/types'
import { keyService } from '../services/crud'

type KeyState = {
  keys: SSHKey[]
  loading: boolean
  initialize: () => Promise<void>
  addKey: (key: SSHKey & { private_key?: string; passphrase?: string }) => Promise<void>
  updateKey: (key: SSHKey & { private_key?: string; passphrase?: string }) => Promise<void>
  removeKey: (id: string) => Promise<void>
  exportKeyToHost: (keyId: string, connectionId: string) => Promise<import('@/types').ConnectionConfig>
}

export const useKeyStore = create<KeyState>((set) => ({
  keys: [],
  loading: false,

  initialize: async () => {
    set({ loading: true })
    try {
      const keys = await keyService.getAll()
      set({ keys, loading: false })
    } catch (error) {
      console.error('Failed to load keys:', error)
      set({ loading: false })
    }
  },

  addKey: async (key) => {
    await keyService.create(key)
    set((state) => ({ keys: [...state.keys, key] }))
  },

  updateKey: async (key) => {
    await keyService.update(key)
    set((state) => ({
      keys: state.keys.map((item) => (item.id === key.id ? key : item)),
    }))
  },

  removeKey: async (id) => {
    await keyService.delete(id)
    set((state) => ({ keys: state.keys.filter((item) => item.id !== id) }))
  },

  exportKeyToHost: async (keyId, connectionId) => {
    return keyService.exportToHost(keyId, connectionId)
  },
}))
