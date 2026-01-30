import { useState, useCallback, useEffect } from 'react'
import { snippetService } from '@/services/ipc/snippets'
import { Snippet, CreateSnippetRequest, UpdateSnippetRequest } from '@/types/snippet'
import { toast } from 'sonner'

export const useSnippets = () => {
  const [snippets, setSnippets] = useState<Snippet[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadSnippets = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await snippetService.list()
      setSnippets(data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load snippets'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  const createSnippet = useCallback(async (request: CreateSnippetRequest) => {
    try {
      const snippet = await snippetService.create(request)
      setSnippets((prev) => [snippet, ...prev])
      toast.success('Snippet created')
      return snippet
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create snippet'
      toast.error(errorMessage)
      throw err
    }
  }, [])

  const updateSnippet = useCallback(async (request: UpdateSnippetRequest) => {
    try {
      const snippet = await snippetService.update(request)
      setSnippets((prev) => prev.map((s) => (s.id === snippet.id ? snippet : s)))
      toast.success('Snippet updated')
      return snippet
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update snippet'
      toast.error(errorMessage)
      throw err
    }
  }, [])

  const deleteSnippet = useCallback(async (id: string) => {
    try {
      await snippetService.delete(id)
      setSnippets((prev) => prev.filter((s) => s.id !== id))
      toast.success('Snippet deleted')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete snippet'
      toast.error(errorMessage)
      throw err
    }
  }, [])

  useEffect(() => {
    loadSnippets()
  }, [loadSnippets])

  return {
    snippets,
    loading,
    error,
    loadSnippets,
    createSnippet,
    updateSnippet,
    deleteSnippet
  }
}
