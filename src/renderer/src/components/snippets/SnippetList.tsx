import { useState } from 'react'
import { Snippet } from '@/types/snippet'
import { SnippetCard } from './SnippetCard'
import { EmptyState } from '@/components/common/EmptyState'
import { SearchEmptyState } from '@/components/connection/SearchEmptyState'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Braces } from 'lucide-react'

interface SnippetListProps {
  snippets: Snippet[]
  loading: boolean
  searchQuery?: string
  onView: (snippet: Snippet) => void
  onEdit: (snippet: Snippet) => void
  onDelete: (snippet: Snippet) => void
}

export function SnippetList({
  snippets,
  loading,
  searchQuery,
  onView,
  onEdit,
  onDelete
}: SnippetListProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-sm text-muted-foreground">Loading snippets...</div>
      </div>
    )
  }

  if (snippets.length === 0) {
    if (searchQuery && searchQuery.trim()) {
      return <SearchEmptyState />
    }
    return (
      <EmptyState
        icon={Braces}
        title="No snippets"
        description="Create snippets to save frequently used commands"
      />
    )
  }

  return (
    <ScrollArea className="h-full" onClick={() => setSelectedId(null)}>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4 p-6">
        {snippets.map((snippet) => (
          <SnippetCard
            key={snippet.id}
            snippet={snippet}
            selected={selectedId === snippet.id}
            onSelect={(s) => setSelectedId(s.id)}
            onView={onView}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </ScrollArea>
  )
}
