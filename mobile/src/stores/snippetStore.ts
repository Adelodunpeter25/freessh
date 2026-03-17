import { create } from 'zustand'
import type { Snippet } from '@/types'
import { snippetService } from '../services/crud'

type SnippetState = {
  snippets: Snippet[]
  loading: boolean
  initialize: () => Promise<void>
  addSnippet: (snippet: Snippet) => Promise<void>
  updateSnippet: (snippet: Snippet) => Promise<void>
  removeSnippet: (id: string) => Promise<void>
}

export const useSnippetStore = create<SnippetState>((set) => ({
  snippets: [],
  loading: false,

  initialize: async () => {
    set({ loading: true })
    try {
      const snippets = await snippetService.getAll()
      set({ snippets, loading: false })
    } catch (error) {
      console.error('Failed to load snippets:', error)
      set({ loading: false })
    }
  },

  addSnippet: async (snippet) => {
    await snippetService.create(snippet)
    set((state) => ({ snippets: [...state.snippets, snippet] }))
  },

  updateSnippet: async (snippet) => {
    await snippetService.update(snippet)
    set((state) => ({
      snippets: state.snippets.map((item) =>
        item.id === snippet.id ? snippet : item
      ),
    }))
  },

  removeSnippet: async (id) => {
    await snippetService.delete(id)
    set((state) => ({ snippets: state.snippets.filter((item) => item.id !== id) }))
  },
}))
