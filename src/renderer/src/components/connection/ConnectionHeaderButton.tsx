import { Server, Terminal, Loader2, FolderPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ConnectionHeaderButtonProps {
  onNewConnection: () => void
  onNewLocalTerminal: () => void
  onNewGroup: () => void
  localTerminalLoading: boolean
}

export function ConnectionHeaderButton({ 
  onNewConnection, 
  onNewLocalTerminal,
  onNewGroup,
  localTerminalLoading 
}: ConnectionHeaderButtonProps) {
  const buttonClassName =
    "font-medium border border-zinc-200 bg-zinc-50 text-zinc-800 hover:bg-zinc-100 hover:border-zinc-300 hover:shadow-sm transition-colors transition-shadow dark:border-transparent dark:bg-secondary dark:text-secondary-foreground dark:hover:bg-secondary/80 dark:hover:border-border/80"

  return (
    <div className="flex items-center gap-2 shrink-0">
      <Button 
        onClick={onNewConnection}
        variant="secondary" 
        size="sm"
        className={buttonClassName}
      >
        <Server className="h-4 w-4 mr-2" />
        NEW CONNECTION
      </Button>

      <Button 
        onClick={onNewLocalTerminal}
        variant="secondary" 
        size="sm"
        disabled={localTerminalLoading}
        className={buttonClassName}
      >
        {localTerminalLoading ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <Terminal className="h-4 w-4 mr-2" />
        )}
        LOCAL TERMINAL
      </Button>

      <Button 
        onClick={onNewGroup}
        variant="secondary" 
        size="sm"
        className={buttonClassName}
      >
        <FolderPlus className="h-4 w-4 mr-2" />
        NEW GROUP
      </Button>
    </div>
  )
}
