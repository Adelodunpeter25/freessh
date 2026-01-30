import { useMemo } from 'react'
import { Snippet } from '@/types/snippet'

export function useSnippetSearch(snippets: Snippet[], searchQuery: string) {
  const filteredSnippets = useMemo(() => {
    if (!searchQuery.trim()) {
      return snippets
    }

    const query = searchQuery.toLowerCase()
    return snippets.filter(
      (snippet) =>
        snippet.name.toLowerCase().includes(query) ||
        snippet.command.toLowerCase().includes(query) ||
        snippet.tags?.some((tag) => tag.toLowerCase().includes(query))
    )
  }, [snippets, searchQuery])

  return { filteredSnippets }
}
