import { useLogs } from '@/hooks/logs'
import { LogList, LogViewer } from '@/components/logs'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export function LogsPage() {
  const { 
    logs, 
    loading, 
    deleteLog, 
    selectedLog, 
    logContent, 
    loadingContent, 
    openLog, 
    closeLog 
  } = useLogs()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner />
      </div>
    )
  }

  if (selectedLog) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-2 p-4 border-b">
          <Button variant="ghost" size="icon" onClick={closeLog}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="font-semibold">{selectedLog.connection_name}</h2>
        </div>
        <div className="flex-1">
          {loadingContent ? (
            <div className="flex items-center justify-center h-full">
              <LoadingSpinner />
            </div>
          ) : (
            <LogViewer content={logContent} />
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Session Logs</h2>
      </div>
      <div className="flex-1 overflow-auto">
        <LogList logs={logs} onDelete={deleteLog} onOpen={openLog} />
      </div>
    </div>
  )
}
