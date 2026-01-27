import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface KeySearchBarProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  resultCount: number
}

export function KeySearchBar({ searchQuery, onSearchChange, resultCount }: KeySearchBarProps) {
  const isSearching = searchQuery.trim().length > 0

  return (
    <div className="relative flex-1">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search keys by name, algorithm, or size..."
        className="pl-10 pr-10 bg-muted/50"
      />
      {isSearching && (
        <button
          onClick={() => onSearchChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
