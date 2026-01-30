import { useState } from 'react'
import { useSnippets, useSnippetSearch } from '@/hooks/snippets'
import { Snippet } from '@/types/snippet'
import { SnippetSearchBar } from '@/components/snippets/SnippetSearchBar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Braces } from 'lucide-react'

interface TerminalSnippetsListProps {
  onSelectSnippet: (snippet: Snippet) => void
}

export function TerminalSnippetsList({ onSelectSnippet }: TerminalSnippetsListProps) {
  const { snippets, loading } = useSnippets()
  const [searchQuery, setSearchQuery] = useState('')
  const { filteredSnippets } = useSnippetSearch(snippets, searchQuery)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-sm text-muted-foreground">Loading snippets...</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-2 py-4 border-b border-border">
        <SnippetSearchBar
          value={searchQuery}
          onChange={setSearchQuery}
        />
      </div>

      <ScrollArea className="flex-1">
        {filteredSnippets.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <Braces className="h-12 w-12 text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground">
              {searchQuery ? 'No snippets found' : 'No snippets yet'}
            </p>
          </div>
        ) : (
          <div className="space-y-1 pr-2">
            {filteredSnippets.map((snippet) => (
              <div
                key={snippet.id}
                className="group border-t border-b border-border p-2"
              >
                <div className="flex items-start gap-2">
                  <Braces className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="text-sm font-medium text-foreground truncate flex-1">
                        {snippet.name}
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                        <button
                          onClick={() => onSelectSnippet(snippet)}
                          className="text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                        >
                          Paste
                        </button>
                        <button
                          onClick={() => onSelectSnippet(snippet)}
                          className="text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                        >
                          Run
                        </button>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground truncate font-mono">
                      {snippet.command}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
