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
  return (
    <div className="flex items-center gap-2 shrink-0">
      <Button 
        onClick={onNewConnection}
        variant="secondary" 
        size="sm"
        className="font-medium hover:bg-secondary/80 transition-colors"
      >
        <Server className="h-4 w-4 mr-2" />
        NEW CONNECTION
      </Button>

      <Button 
        onClick={onNewLocalTerminal}
        variant="secondary" 
        size="sm"
        disabled={localTerminalLoading}
        className="font-medium hover:bg-secondary/80 transition-colors"
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
        className="font-medium hover:bg-secondary/80 transition-colors"
      >
        <FolderPlus className="h-4 w-4 mr-2" />
        NEW GROUP
      </Button>
    </div>
  )
}
