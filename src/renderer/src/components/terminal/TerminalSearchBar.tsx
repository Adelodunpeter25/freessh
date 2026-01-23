import { useState } from 'react'
import { X, ChevronUp, ChevronDown } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface TerminalSearchBarProps {
  onSearch: (query: string, direction: 'next' | 'prev') => void
  onClose: () => void
}

export function TerminalSearchBar({ onSearch, onClose }: TerminalSearchBarProps) {
  const [query, setQuery] = useState('')

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

  return (
    <div className="absolute top-0 right-0 m-2 flex items-center gap-1 bg-background border rounded-lg shadow-lg p-1 z-10">
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Find..."
        className="h-8 w-48"
        autoFocus
      />
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
