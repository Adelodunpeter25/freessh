import { Terminal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface NewLocalTerminalButtonProps {
  onClick: () => void
}

export function NewLocalTerminalButton({ onClick }: NewLocalTerminalButtonProps) {
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            onClick={onClick} 
            size="icon"
            variant="secondary"
            className="fixed bottom-6 right-24 h-14 w-14 rounded-full shadow-lg z-50"
          >
            <Terminal className="h-6 w-6" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Open local terminal</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
