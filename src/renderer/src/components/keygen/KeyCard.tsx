import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Copy, Trash2, Key } from 'lucide-react'
import { toast } from 'sonner'

interface KeyCardProps {
  fingerprint: string
  comment?: string
  keyType: string
  onDelete: () => void
  onCopy: () => void
}

export function KeyCard({ fingerprint, comment, keyType, onDelete, onCopy }: KeyCardProps) {
  const copyFingerprint = () => {
    navigator.clipboard.writeText(fingerprint)
    toast.success('Fingerprint copied')
  }

  return (
    <Card className="p-4 hover:bg-accent/50 transition-colors">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Key className="w-5 h-5 text-primary" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-muted-foreground uppercase">
              {keyType}
            </span>
            {comment && (
              <span className="text-sm text-foreground truncate">
                {comment}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground font-mono truncate">
            {fingerprint}
          </p>
        </div>

        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={copyFingerprint}
          >
            <Copy className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive"
            onClick={onDelete}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  )
}
