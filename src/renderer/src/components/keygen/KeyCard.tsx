import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Trash2, Key } from 'lucide-react'

interface KeyCardProps {
  fingerprint: string
  comment?: string
  keyType: string
  onDelete: () => void
}

export function KeyCard({ fingerprint, comment, keyType, onDelete }: KeyCardProps) {
  return (
    <Card className="group p-4 hover:bg-muted/50 transition-all cursor-pointer border-border hover:shadow-md">
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

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  )
}
