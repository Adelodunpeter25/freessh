import { LogEntry } from '@/types/log'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { formatDate } from '@/utils/formatDate'
import { useState } from 'react'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'

interface LogListProps {
  logs: LogEntry[]
  onDelete: (filename: string) => void
  onOpen: (log: LogEntry) => void
}

export function LogList({ logs, onDelete, onOpen }: LogListProps) {
  const [deleteLog, setDeleteLog] = useState<LogEntry | null>(null)

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const handleDelete = () => {
    if (deleteLog) {
      onDelete(deleteLog.filename)
      setDeleteLog(null)
    }
  }

  if (!logs || logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
        <p>No logs found</p>
        <p className="text-sm">Start recording terminal sessions to see logs here</p>
      </div>
    )
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>File Size</TableHead>
            <TableHead className="w-20">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => {
            const timestamp = new Date(log.timestamp).getTime()
            return (
              <TableRow
                key={log.filename}
                className="cursor-pointer hover:bg-accent"
                onDoubleClick={() => onOpen(log)}
              >
                <TableCell className="font-medium">{log.connection_name}</TableCell>
                <TableCell>{formatDate(timestamp, true)}</TableCell>
                <TableCell>{formatSize(log.size)}</TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation()
                      setDeleteLog(log)
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>

      <ConfirmDialog
        open={!!deleteLog}
        onOpenChange={(open) => !open && setDeleteLog(null)}
        title="Delete Log"
        description={`Are you sure you want to delete "${deleteLog?.connection_name}"? This action cannot be undone.`}
        onConfirm={handleDelete}
      />
    </>
  )
}
