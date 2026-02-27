import { useState, useMemo } from 'react'
import { Snippet } from '@/types/snippet'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Search, Code } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'

interface SnippetPickerProps {
  isOpen: boolean
  snippets: Snippet[]
  onClose: () => void
  onSelect: (snippet: Snippet) => void
}

export function SnippetPicker({ isOpen, snippets, onClose, onSelect }: SnippetPickerProps) {
  const [search, setSearch] = useState('')

  const filteredSnippets = useMemo(() => {
    if (!search) return snippets

    const query = search.toLowerCase()
    return snippets.filter(
      (snippet) =>
        snippet.name.toLowerCase().includes(query) ||
        snippet.command.toLowerCase().includes(query)
    )
  }, [snippets, search])

  const handleSelect = (snippet: Snippet) => {
    onSelect(snippet)
    onClose()
    setSearch('')
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Insert Snippet</DialogTitle>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search snippets..."
            className="pl-10"
            autoFocus
          />
        </div>

        <ScrollArea className="h-[400px] -mx-6 px-6">
          {filteredSnippets.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <Code className="h-12 w-12 mb-2 opacity-50" />
              <p className="text-sm">No snippets found</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredSnippets.map((snippet) => (
                <button
                  key={snippet.id}
                  onClick={() => handleSelect(snippet)}
                  className="w-full text-left p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Code className="h-4 w-4 text-muted-foreground shrink-0" />
                    <h3 className="font-medium text-sm">{snippet.name}</h3>
                  </div>
                  
                  <div className="bg-muted/50 rounded px-2 py-1">
                    <code className="text-xs font-mono text-foreground line-clamp-2">
                      {snippet.command}
                    </code>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
