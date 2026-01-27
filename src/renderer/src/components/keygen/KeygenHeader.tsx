import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

interface KeygenHeaderProps {
  onGenerateKey: () => void
}

export function KeygenHeader({ onGenerateKey }: KeygenHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-lg font-semibold">SSH Keys</h2>
        <p className="text-sm text-muted-foreground">
          Manage your SSH keys
        </p>
      </div>
      <Button onClick={onGenerateKey} size="sm">
        <Plus className="w-4 h-4 mr-2" />
        Generate Key
      </Button>
    </div>
  )
}
