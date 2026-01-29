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
        className="font-medium hover:bg-secondary/80 hover:scale-105 transition-all rounded-r-none"
      >
        <Server className="h-4 w-4 mr-2" />
        NEW CONNECTION
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="secondary"
            size="sm"
            className="px-2 rounded-l-none border-l border-border/50"
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem 
            onClick={onNewLocalTerminal}
            disabled={localTerminalLoading}
          >
            {localTerminalLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Terminal className="h-4 w-4 mr-2" />
            )}
            Local Terminal
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
