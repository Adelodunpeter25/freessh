import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Trash2, Copy, Fingerprint } from 'lucide-react'
import { KnownHost } from '@/types/knownHost'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface KnownHostCardProps {
  host: KnownHost
  selected?: boolean
  onSelect?: () => void
  onRemove: (id: string) => void
}

export function KnownHostCard({ host, selected, onSelect, onRemove }: KnownHostCardProps) {
  const copyFingerprint = () => {
    navigator.clipboard.writeText(host.fingerprint)
    toast.success('Fingerprint copied to clipboard')
  }

  return (
    <Card
      className={cn(
        'relative cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02]',
        selected && 'ring-2 ring-primary shadow-md'
      )}
      onClick={onSelect}
    >
      <div className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Fingerprint className="h-5 w-5 text-primary flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate">{host.hostname}:{host.port}</h3>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation()
              onRemove(host.id)
            }}
            className="text-destructive hover:text-destructive flex-shrink-0"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Fingerprint */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">Fingerprint</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                copyFingerprint()
              }}
              className="h-6 px-2"
            >
              <Copy className="h-3 w-3" />
            </Button>
          </div>
          <p className="text-xs font-mono break-all text-muted-foreground">{host.fingerprint}</p>
        </div>
      </div>
    </Card>
  )
}
