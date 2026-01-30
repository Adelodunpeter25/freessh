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
      <div className="p-4 border-b border-border">
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
          <div className="p-2 space-y-1">
            {filteredSnippets.map((snippet) => (
              <div
                key={snippet.id}
                className="group relative border-t border-b border-transparent hover:border-border transition-colors"
              >
                <div className="p-3">
                  <div className="flex items-start gap-2 mb-2">
                    <Braces className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground truncate">
                        {snippet.name}
                      </div>
                      <div className="text-xs text-muted-foreground truncate font-mono mt-0.5">
                        {snippet.command}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onSelectSnippet(snippet)}
                      className="flex-1 text-xs py-1.5 px-3 rounded bg-primary/10 hover:bg-primary/20 text-primary font-medium transition-colors"
                    >
                      Paste
                    </button>
                    <button
                      onClick={() => onSelectSnippet(snippet)}
                      className="flex-1 text-xs py-1.5 px-3 rounded bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
                    >
                      Run
                    </button>
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
