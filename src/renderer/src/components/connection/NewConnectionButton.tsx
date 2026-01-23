import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface NewConnectionButtonProps {
  onClick: () => void
}

export function NewConnectionButton({ onClick }: NewConnectionButtonProps) {
  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            onClick={onClick} 
            size="icon"
            className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50 group"
          >
            <Plus className="h-6 w-6 transition-transform group-hover:rotate-90" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Add new connection</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
