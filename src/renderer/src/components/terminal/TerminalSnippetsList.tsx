import { useState, useEffect, useCallback } from 'react'
import { useSnippetStore } from '@/stores'
import { useSnippetSearch } from '@/hooks/snippets'
import { Snippet } from '@/types/snippet'
import { SnippetSearchBar } from '@/components/snippets/SnippetSearchBar'
import { SnippetsContextMenu } from '@/components/contextmenu'
import { VariableInputDialog } from '@/components/snippets/VariableInputDialog'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Braces, Plus } from 'lucide-react'
import { parseVariables, replaceVariables } from '@/utils/snippetVariables'

interface TerminalSnippetsListProps {
  onPasteSnippet: (snippet: Snippet) => void
  onRunSnippet: (snippet: Snippet) => void
  onEditSnippet: (snippet: Snippet) => void
  onDeleteSnippet: (snippet: Snippet) => void
  onNewSnippet: () => void
}

export function TerminalSnippetsList({ onPasteSnippet, onRunSnippet, onEditSnippet, onDeleteSnippet, onNewSnippet }: TerminalSnippetsListProps) {
  const snippets = useSnippetStore((state) => state.snippets)
  const loading = useSnippetStore((state) => state.loading)
  const loadSnippets = useSnippetStore((state) => state.loadSnippets)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [showVariableDialog, setShowVariableDialog] = useState(false)
  const [currentSnippet, setCurrentSnippet] = useState<Snippet | null>(null)
  const [variables, setVariables] = useState<string[]>([])
  const { filteredSnippets } = useSnippetSearch(snippets, searchQuery)

  useEffect(() => {
    loadSnippets()
  }, [])

  const handleClearSelection = useCallback(() => {
    setSelectedId(null)
  }, [])

  const handleSelectSnippet = useCallback((id: string) => {
    setSelectedId(id)
  }, [])

  const handleRunClick = useCallback((snippet: Snippet) => {
    const vars = parseVariables(snippet.command)
    if (vars.length > 0) {
      setCurrentSnippet(snippet)
      setVariables(vars)
      setShowVariableDialog(true)
    } else {
      onRunSnippet(snippet)
    }
  }, [onRunSnippet])

  const handleVariableConfirm = useCallback((values: Record<string, string>) => {
    if (currentSnippet) {
      const finalCommand = replaceVariables(currentSnippet.command, values)
      onRunSnippet({ ...currentSnippet, command: finalCommand })
      setCurrentSnippet(null)
    }
  }, [currentSnippet, onRunSnippet])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-sm text-muted-foreground">Loading snippets...</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-2 py-4 border-b border-border flex items-center gap-2">
        <SnippetSearchBar
          value={searchQuery}
          onChange={setSearchQuery}
        />
        <Button
          variant="ghost"
          size="icon"
          onClick={onNewSnippet}
          className="flex-shrink-0"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 pb-6" onClick={handleClearSelection}>
        {filteredSnippets.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <Braces className="h-12 w-12 text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground">
              {searchQuery ? 'No snippets found' : 'No snippets yet'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredSnippets.map((snippet) => {
              const hasVariables = parseVariables(snippet.command).length > 0
              return (
              <SnippetsContextMenu
                key={snippet.id}
                snippet={snippet}
                onEdit={() => onEditSnippet(snippet)}
                onDelete={() => onDeleteSnippet(snippet)}
              >
                <div
                  className={`group p-2 rounded-lg transition-all cursor-pointer ${
                    selectedId === snippet.id
                      ? 'bg-accent shadow-sm'
                      : 'hover:bg-muted/50 hover:shadow-sm'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleSelectSnippet(snippet.id)
                  }}
                  onContextMenu={(e) => {
                    e.stopPropagation()
                    handleSelectSnippet(snippet.id)
                  }}
                >
                <div className="flex items-start gap-2">
                  <Braces className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="text-sm font-medium text-foreground truncate flex-1">
                        {snippet.name}
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                        {!hasVariables && (
                          <button
                            onClick={() => onPasteSnippet(snippet)}
                            className="text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                          >
                            Paste
                          </button>
                        )}
                        <button
                          onClick={() => handleRunClick(snippet)}
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
              </SnippetsContextMenu>
              )
            })}
          </div>
        )}
      </div>

      <VariableInputDialog
        open={showVariableDialog}
        onOpenChange={setShowVariableDialog}
        variables={variables}
        onConfirm={handleVariableConfirm}
      />
    </div>
  )
}
