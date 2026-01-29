import { Server, ChevronDown, ChevronUp, Terminal, Loader2, FolderPlus } from 'lucide-react'
import { useState } from 'react'
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
  onNewGroup: () => void
  localTerminalLoading: boolean
}

export function ConnectionHeaderButton({ 
  onNewConnection, 
  onNewLocalTerminal,
  onNewGroup,
  localTerminalLoading 
}: ConnectionHeaderButtonProps) {
  const [open, setOpen] = useState(false)

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

      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="secondary"
            size="sm"
            className="px-2 rounded-l-none border-l border-secondary-foreground/20 hover:bg-secondary/80 hover:scale-105 transition-all"
          >
            {open ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" side="right">
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
          <DropdownMenuItem 
            onClick={onNewGroup}
            className="font-medium"
          >
            <FolderPlus className="h-4 w-4 mr-2" />
            NEW GROUP
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
