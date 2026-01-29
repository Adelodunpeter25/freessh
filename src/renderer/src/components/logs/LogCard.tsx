import { LogEntry } from '@/types/log'
import { Card } from '@/components/ui/card'
import { FileText, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/utils/formatDate'

interface LogCardProps {
  log: LogEntry
  onDelete: (filename: string) => void
  onOpen: (log: LogEntry) => void
}

export function LogCard({ log, onDelete, onOpen }: LogCardProps) {
  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const timestamp = new Date(log.timestamp).getTime()

  return (
    <Card
      className="p-4 hover:bg-accent cursor-pointer transition-colors"
      onDoubleClick={() => onOpen(log)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <FileText className="h-5 w-5 text-muted-foreground" />
          <div className="flex-1">
            <h3 className="font-medium">{log.connection_name}</h3>
            <p className="text-sm text-muted-foreground">
              {formatDate(timestamp, true)} • {formatSize(log.size)}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation()
            onDelete(log.filename)
          }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  )
}
