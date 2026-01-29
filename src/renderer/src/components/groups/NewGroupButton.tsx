import { FolderPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface NewGroupButtonProps {
  onClick: () => void
}

export function NewGroupButton({ onClick }: NewGroupButtonProps) {
  return (
    <Button 
      onClick={onClick}
      variant="outline" 
      size="sm"
      className="shrink-0"
    >
      <FolderPlus className="h-4 w-4 mr-2" />
      NEW GROUP
    </Button>
  )
}
