import { Snippet } from '@/types/snippet'
import { SnippetCard } from './SnippetCard'
import { EmptyState } from '@/components/common/EmptyState'
import { Code } from 'lucide-react'

interface SnippetListProps {
  snippets: Snippet[]
  loading: boolean
  onEdit: (snippet: Snippet) => void
  onDelete: (snippet: Snippet) => void
}

export function SnippetList({ snippets, loading, onEdit, onDelete }: SnippetListProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-sm text-muted-foreground">Loading snippets...</div>
      </div>
    )
  }

  if (snippets.length === 0) {
    return (
      <EmptyState
        icon={Code}
        title="No snippets"
        description="Create snippets to save frequently used commands"
      />
    )
  }

  return (
    <div className="space-y-2 p-4">
      {snippets.map((snippet) => (
        <SnippetCard
          key={snippet.id}
          snippet={snippet}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}
