import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Trash2, Copy } from 'lucide-react'
import { KnownHost } from '@/types/knownHost'
import { toast } from 'sonner'

interface KnownHostCardProps {
  host: KnownHost
  onRemove: (id: string) => void
}

export function KnownHostCard({ host, onRemove }: KnownHostCardProps) {
  const copyFingerprint = () => {
    navigator.clipboard.writeText(host.fingerprint)
    toast.success('Fingerprint copied to clipboard')
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{host.hostname}</h3>
            <p className="text-sm text-muted-foreground">Port {host.port}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onRemove(host.id)}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div>
          <p className="text-xs text-muted-foreground">Key Type</p>
          <p className="text-sm font-mono">{host.keyType}</p>
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-muted-foreground">Fingerprint</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={copyFingerprint}
              className="h-6 px-2"
            >
              <Copy className="h-3 w-3" />
            </Button>
          </div>
          <p className="text-xs font-mono break-all">{host.fingerprint}</p>
        </div>
        <div className="flex gap-4 text-xs text-muted-foreground pt-2">
          <div>
            <span>First seen: </span>
            <span>{new Date(host.firstSeen).toLocaleDateString()}</span>
          </div>
          <div>
            <span>Last seen: </span>
            <span>{new Date(host.lastSeen).toLocaleDateString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
