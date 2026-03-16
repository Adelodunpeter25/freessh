import { create } from 'zustand'

import type { Snippet } from '../types'

type SnippetState = {
  snippets: Snippet[]
  addSnippet: (snippet: Snippet) => void
  updateSnippet: (snippet: Snippet) => void
  removeSnippet: (id: string) => void
}

const seedSnippets: Snippet[] = [
  {
    id: 'snip-1',
    title: 'Restart Nginx',
    command: 'sudo systemctl restart nginx',
    description: 'Graceful restart of nginx service.',
  },
  {
    id: 'snip-2',
    title: 'Check Disk Usage',
    command: 'df -h',
    description: 'Quick disk usage overview.',
  },
]

export const useSnippetStore = create<SnippetState>((set) => ({
  snippets: seedSnippets,
  addSnippet: (snippet) => set((state) => ({ snippets: [...state.snippets, snippet] })),
  updateSnippet: (snippet) =>
    set((state) => ({
      snippets: state.snippets.map((item) =>
        item.id === snippet.id ? snippet : item
      ),
    })),
  removeSnippet: (id) =>
    set((state) => ({ snippets: state.snippets.filter((item) => item.id !== id) })),
}))
