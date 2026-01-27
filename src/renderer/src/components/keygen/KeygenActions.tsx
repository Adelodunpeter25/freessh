import { Button } from '@/components/ui/button'
import { Plus, Upload } from 'lucide-react'

interface KeygenActionsProps {
  onGenerateKey: () => void
  onImportKey: () => void
}

export function KeygenActions({ onGenerateKey, onImportKey }: KeygenActionsProps) {
  return (
    <div className="p-4 border-t border-border bg-background">
      <div className="flex flex-col gap-2">
        <Button onClick={onImportKey} variant="outline" className="w-full">
          <Upload className="w-4 h-4 mr-2" />
          Import Key
        </Button>
        <Button onClick={onGenerateKey} className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          Generate Key
        </Button>
      </div>
    </div>
  )
}
