import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'

interface SnippetSearchBarProps {
  value: string
  onChange: (value: string) => void
}

export function SnippetSearchBar({ value, onChange }: SnippetSearchBarProps) {
  return (
    <div className="relative flex-1">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search snippets..."
        className="pl-10 pr-10 bg-muted/50"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
