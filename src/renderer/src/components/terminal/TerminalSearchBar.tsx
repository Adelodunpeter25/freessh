import { useState } from 'react'
import { X, ChevronUp, ChevronDown } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface TerminalSearchBarProps {
  onSearch: (query: string, direction: 'next' | 'prev') => void
  onClose: () => void
  results?: { index: number, total: number } | null
}

export function TerminalSearchBar({ onSearch, onClose, results }: TerminalSearchBarProps) {
  const [query, setQuery] = useState('')

  console.log('SearchBar results:', results, 'query:', query)

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value
    setQuery(newQuery)
    if (newQuery) {
      onSearch(newQuery, 'next')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (query) {
        onSearch(query, e.shiftKey ? 'prev' : 'next')
      }
    } else if (e.key === 'Escape') {
      onClose()
    }
  }

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select()
  }

  return (
    <div className="absolute top-0 right-0 m-2 flex items-center gap-1 bg-background border rounded-lg shadow-lg p-1 z-10">
      <Input
        value={query}
        onChange={handleQueryChange}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        placeholder="Find..."
        className="h-8 w-48"
        autoFocus
      />
      <div className="w-16 flex items-center justify-center">
        {query && results && results.total > 0 && (
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {results.index + 1} of {results.total}
          </span>
        )}
        {query && results && results.total === 0 && (
          <span className="text-xs text-destructive whitespace-nowrap">
            No results
          </span>
        )}
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => onSearch(query, 'prev')}
      >
        <ChevronUp className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => onSearch(query, 'next')}
      >
        <ChevronDown className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={onClose}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  )
}
