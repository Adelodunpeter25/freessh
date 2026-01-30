import { create } from 'zustand'
import { Snippet, CreateSnippetRequest, UpdateSnippetRequest } from '@/types/snippet'
import { snippetService } from '@/services/ipc/snippets'
import { toast } from 'sonner'

interface SnippetStore {
  snippets: Snippet[]
  loading: boolean
  loadSnippets: () => Promise<void>
  createSnippet: (request: CreateSnippetRequest) => Promise<Snippet>
  updateSnippet: (request: UpdateSnippetRequest) => Promise<Snippet>
  deleteSnippet: (id: string) => Promise<void>
}

export const useSnippetStore = create<SnippetStore>((set) => ({
  snippets: [],
  loading: false,

  loadSnippets: async () => {
    set({ loading: true })
    try {
      const snippets = await snippetService.list()
      set({ snippets, loading: false })
    } catch (error) {
      toast.error('Failed to load snippets')
      set({ loading: false })
    }
  },

  createSnippet: async (request: CreateSnippetRequest) => {
    try {
      const snippet = await snippetService.create(request)
      set((state) => ({ snippets: [snippet, ...state.snippets] }))
      toast.success('Snippet created')
      return snippet
    } catch (error) {
      toast.error('Failed to create snippet')
      throw error
    }
  },

  updateSnippet: async (request: UpdateSnippetRequest) => {
    try {
      const snippet = await snippetService.update(request)
      set((state) => ({
        snippets: state.snippets.map((s) => (s.id === snippet.id ? snippet : s))
      }))
      toast.success('Snippet updated')
      return snippet
    } catch (error) {
      toast.error('Failed to update snippet')
      throw error
    }
  },

  deleteSnippet: async (id: string) => {
    try {
      await snippetService.delete(id)
      set((state) => ({ snippets: state.snippets.filter((s) => s.id !== id) }))
      toast.success('Snippet deleted')
    } catch (error) {
      toast.error('Failed to delete snippet')
      throw error
    }
  }
}))
