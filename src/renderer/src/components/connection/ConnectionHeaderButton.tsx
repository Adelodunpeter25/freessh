import { Server, ChevronDown, Terminal, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface ConnectionHeaderButtonProps {
  onNewConnection: () => void
  onNewLocalTerminal: () => void
  localTerminalLoading: boolean
}

export function ConnectionHeaderButton({ 
  onNewConnection, 
  onNewLocalTerminal,
  localTerminalLoading 
}: ConnectionHeaderButtonProps) {
  return (
    <div className="flex items-center shrink-0">
      <Button 
        onClick={onNewConnection}
        variant="secondary" 
        size="sm"
        className="font-medium hover:bg-secondary/80 hover:scale-105 transition-all rounded-r-none border-r-0"
      >
        <Server className="h-4 w-4 mr-2" />
        NEW CONNECTION
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="secondary"
            size="sm"
            className="px-2 rounded-l-none border-l border-secondary-foreground/20 hover:bg-secondary/80 hover:scale-105 transition-all"
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem 
            onClick={onNewLocalTerminal}
            disabled={localTerminalLoading}
            className="font-medium"
          >
            {localTerminalLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Terminal className="h-4 w-4 mr-2" />
            )}
            LOCAL TERMINAL
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
