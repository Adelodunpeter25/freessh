import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface NewConnectionButtonProps {
  onClick: () => void
}

export function NewConnectionButton({ onClick }: NewConnectionButtonProps) {
  return (
    <Button 
      onClick={onClick} 
      size="icon"
      className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50"
    >
      <Plus className="h-6 w-6" />
    </Button>
  )
}
