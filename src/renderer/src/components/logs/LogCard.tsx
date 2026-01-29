import { LogEntry } from '@/types/log'
import { TableCell, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { formatDateWithTime } from '@/utils/formatDate'

interface LogCardProps {
  log: LogEntry
  onDelete: () => void
  onOpen: () => void
}

export function LogCard({ log, onDelete, onOpen }: LogCardProps) {
  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const timestamp = new Date(log.timestamp).getTime()

  return (
    <TableRow
      className="cursor-pointer hover:bg-muted/50"
      onDoubleClick={onOpen}
    >
      <TableCell className="text-muted-foreground">{formatDateWithTime(timestamp, true)}</TableCell>
      <TableCell className="font-medium">{log.connection_name}</TableCell>
      <TableCell className="text-muted-foreground">{formatSize(log.size)}</TableCell>
      <TableCell>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>
  )
}
