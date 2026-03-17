import { create } from 'zustand'

import type { Group } from '../types'

type GroupState = {
  groups: Group[]
  addGroup: (group: Group) => void
  updateGroup: (group: Group) => void
  removeGroup: (id: string) => void
}

const seedGroups: Group[] = [
  { 
    id: 'grp-1', 
    name: 'Production', 
    connection_count: 2,
    created_at: new Date().toISOString()
  },
  { 
    id: 'grp-2', 
    name: 'Personal', 
    connection_count: 1,
    created_at: new Date().toISOString()
  },
]

export const useGroupStore = create<GroupState>((set) => ({
  groups: seedGroups,
  addGroup: (group) => set((state) => ({ groups: [...state.groups, group] })),
  updateGroup: (group) =>
    set((state) => ({
      groups: state.groups.map((item) => (item.id === group.id ? group : item)),
    })),
  removeGroup: (id) =>
    set((state) => ({ groups: state.groups.filter((item) => item.id !== id) })),
}))
