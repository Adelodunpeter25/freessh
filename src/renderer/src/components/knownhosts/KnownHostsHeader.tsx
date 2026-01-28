import { Button } from '@/components/ui/button'
import { Upload } from 'lucide-react'

interface KnownHostsHeaderProps {
  onImport: () => void
  importing?: boolean
}

export function KnownHostsHeader({ onImport, importing }: KnownHostsHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-lg font-semibold">Known Hosts</h2>
        <p className="text-sm text-muted-foreground">
          Manage trusted SSH host fingerprints
        </p>
      </div>
      <Button onClick={onImport} size="sm" disabled={importing}>
        <Upload className="w-4 h-4 mr-2" />
        {importing ? 'Importing...' : 'Import from SSH'}
      </Button>
    </div>
  )
}
