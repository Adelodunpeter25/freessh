import { Plus, Server, Terminal, Cable } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ConnectionsHeaderProps {
  onNewConnection: () => void
}

export function ConnectionsHeader({ onNewConnection }: ConnectionsHeaderProps) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b bg-background/95">
      <div className="flex items-center gap-2">
        <Button 
          onClick={onNewConnection}
          variant="secondary" 
          size="sm"
          className="font-medium"
        >
          <Server className="h-4 w-4 mr-2" />
          NEW HOST
        </Button>
        <Button variant="ghost" size="sm" className="font-medium">
          <Terminal className="h-4 w-4 mr-2" />
          TERMINAL
        </Button>
        <Button variant="ghost" size="sm" className="font-medium">
          <Cable className="h-4 w-4 mr-2" />
          SERIAL
        </Button>
      </div>
    </div>
  )
}
