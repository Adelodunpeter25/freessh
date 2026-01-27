import { Button } from '@/components/ui/button'
import { Plus, Upload } from 'lucide-react'

interface KeygenHeaderProps {
  onGenerateKey: () => void
  onImportKey: () => void
}

export function KeygenHeader({ onGenerateKey, onImportKey }: KeygenHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-lg font-semibold">SSH Keys</h2>
        <p className="text-sm text-muted-foreground">
          Manage your SSH keys
        </p>
      </div>
      <div className="flex gap-2">
        <Button onClick={onImportKey} size="sm" variant="outline">
          <Upload className="w-4 h-4 mr-2" />
          Import Key
        </Button>
        <Button onClick={onGenerateKey} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Generate Key
        </Button>
      </div>
    </div>
  )
}
