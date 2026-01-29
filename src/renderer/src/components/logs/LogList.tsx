import { LogEntry } from '@/types/log'
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { LogCard } from './LogCard'
import { useState } from 'react'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'

interface LogListProps {
  logs: LogEntry[]
  onDelete: (filename: string) => void
  onOpen: (log: LogEntry) => void
}

export function LogList({ logs, onDelete, onOpen }: LogListProps) {
  const [deleteLog, setDeleteLog] = useState<LogEntry | null>(null)

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
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="font-semibold">Date</TableHead>
              <TableHead className="font-semibold">Name</TableHead>
              <TableHead className="font-semibold">File Size</TableHead>
              <TableHead className="font-semibold w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <LogCard
                key={log.filename}
                log={log}
                onDelete={() => setDeleteLog(log)}
                onOpen={() => onOpen(log)}
              />
            ))}
          </TableBody>
        </Table>
      </div>

      <ConfirmDialog
        open={!!deleteLog}
        onOpenChange={(open) => !open && setDeleteLog(null)}
        title="Delete Log File"
        description={`Are you sure you want to delete the log file for "${deleteLog?.connection_name}"? This action cannot be undone.`}
        onConfirm={handleDelete}
      />
    </>
  )
}
