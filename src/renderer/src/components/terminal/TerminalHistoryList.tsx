import { useState } from 'react'
import { Search, Trash2, Check, X } from 'lucide-react'
import { Input } from '@renderer/components/ui/input'
import { Button } from '@renderer/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@renderer/components/ui/tooltip'
import { useHistory } from '@renderer/hooks/history/useHistory'
import { useSnippetStore } from '@renderer/stores'
import { terminalService } from '@renderer/services/ipc/terminal'
import { toast } from 'sonner'
import { ConfirmDialog } from '@renderer/components/common/ConfirmDialog'

interface TerminalHistoryListProps {
  activeSessionId: string | null
  onCommandRun?: () => void
}

export function TerminalHistoryList({ activeSessionId, onCommandRun }: TerminalHistoryListProps) {
  const [search, setSearch] = useState('')
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [snippetName, setSnippetName] = useState('')
  const { history, loading, clearHistory } = useHistory()
  const createSnippet = useSnippetStore((state) => state.createSnippet)

  const filtered = history.filter((entry) =>
    entry.command.toLowerCase().includes(search.toLowerCase())
  )

  const handleRun = (command: string) => {
    if (!activeSessionId) {
      toast.error('No active terminal')
      return
    }
    terminalService.sendInput(activeSessionId, command + '\n')
    onCommandRun?.()
  }

  const handlePaste = (command: string) => {
    if (!activeSessionId) {
      toast.error('No active terminal')
      return
    }
    terminalService.sendInput(activeSessionId, command)
  }

  const handleSaveClick = (id: string) => {
    setSavingId(id)
    setSnippetName('')
  }

  const handleSaveConfirm = async (command: string) => {
    if (!snippetName.trim()) {
      toast.error('Please enter a name')
      return
    }
    
    try {
      await createSnippet({ name: snippetName.trim(), command })
      toast.success('Saved to snippets')
      setSavingId(null)
      setSnippetName('')
    } catch (error) {
      toast.error('Failed to save snippet')
    }
  }

  const handleSaveCancel = () => {
    setSavingId(null)
    setSnippetName('')
  }

  const handleClear = async () => {
    await clearHistory()
    setShowClearConfirm(false)
  }

  if (loading) {
    return <div className="p-4 text-sm text-muted-foreground">Loading...</div>
  }

  return (
    <>
      <div className="flex flex-col h-full">
        <div className="p-3 space-y-2">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search history..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-9"
              />
            </div>
            <TooltipProvider delayDuration={150}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowClearConfirm(true)}
                    disabled={history.length === 0}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Clear History</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-2">
          {filtered.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-8">
              {search ? 'No matching commands' : 'No command history'}
            </div>
          ) : (
            filtered.map((entry) => (
              <div
                key={entry.id}
                className="group p-2 rounded-lg hover:bg-muted/50 transition-colors"
              >
                {savingId === entry.id ? (
                  <div className="flex items-center gap-2">
                    <Input
                      autoFocus
                      placeholder="Snippet name..."
                      value={snippetName}
                      onChange={(e) => setSnippetName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSaveConfirm(entry.command)
                        } else if (e.key === 'Escape') {
                          handleSaveCancel()
                        }
                      }}
                      className="h-7 text-sm"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleSaveConfirm(entry.command)}
                      className="h-7 w-7 shrink-0"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleSaveCancel}
                      className="h-7 w-7 shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-mono text-sm break-all flex-1 truncate">{entry.command}</div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePaste(entry.command)}
                        className="h-6 px-2 text-xs"
                      >
                        Paste
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSaveClick(entry.id)}
                        className="h-6 px-2 text-xs"
                      >
                        Save
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <ConfirmDialog
        open={showClearConfirm}
        onOpenChange={setShowClearConfirm}
        onConfirm={handleClear}
        title="Clear History"
        description="Are you sure you want to clear all command history? This cannot be undone."
        confirmText="Clear"
        variant="destructive"
      />
    </>
  )
}
