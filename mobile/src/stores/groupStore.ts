import { create } from 'zustand'
import type { Group } from '@/types'
import { groupService } from '../services/crud'

type GroupState = {
  groups: Group[]
  loading: boolean
  initialize: () => Promise<void>
  addGroup: (group: Group) => Promise<void>
  updateGroup: (group: Group) => Promise<void>
  removeGroup: (id: string) => Promise<void>
}

export const useGroupStore = create<GroupState>((set) => ({
  groups: [],
  loading: false,

  initialize: async () => {
    set({ loading: true })
    try {
      const groups = await groupService.getAll()
      set({ groups, loading: false })
    } catch (error) {
      console.error('Failed to load groups:', error)
      set({ loading: false })
    }
  },

  addGroup: async (group) => {
    await groupService.create(group)
    set((state) => ({ groups: [...state.groups, group] }))
  },

  updateGroup: async (group) => {
    await groupService.update(group)
    set((state) => ({
      groups: state.groups.map((item) => (item.id === group.id ? group : item)),
    }))
  },

  removeGroup: async (id) => {
    await groupService.delete(id)
    set((state) => ({ groups: state.groups.filter((item) => item.id !== id) }))
  },
}))
