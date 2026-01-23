import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ConnectionsHeaderProps {
  onNewConnection: () => void
}

export function ConnectionsHeader({ onNewConnection }: ConnectionsHeaderProps) {
  return (
    <div className="p-4 border-b">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Connections</h1>
        <Button onClick={onNewConnection} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          New Host
        </Button>
      </div>
    </div>
  )
}
