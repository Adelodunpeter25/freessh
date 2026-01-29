import { LogEntry } from '@/types/log'
import { LogCard } from './LogCard'

interface LogListProps {
  logs: LogEntry[]
  onDelete: (filename: string) => void
  onOpen: (log: LogEntry) => void
}

export function LogList({ logs, onDelete, onOpen }: LogListProps) {
  if (logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
        <p>No logs found</p>
        <p className="text-sm">Start recording terminal sessions to see logs here</p>
      </div>
    )
  }

  return (
    <div className="space-y-2 p-4">
      {logs.map((log) => (
        <LogCard key={log.filename} log={log} onDelete={onDelete} onOpen={onOpen} />
      ))}
    </div>
  )
}
