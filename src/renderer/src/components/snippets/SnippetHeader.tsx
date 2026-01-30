import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { SnippetSearchBar } from './SnippetSearchBar'

interface SnippetHeaderProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  onNewSnippet: () => void
}

export function SnippetHeader({ searchQuery, onSearchChange, onNewSnippet }: SnippetHeaderProps) {
  return (
    <div className="flex flex-col gap-3 p-4 border-b">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Snippets</h2>
        <Button onClick={onNewSnippet} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          New Snippet
        </Button>
      </div>
      <SnippetSearchBar value={searchQuery} onChange={onSearchChange} />
    </div>
  )
}
