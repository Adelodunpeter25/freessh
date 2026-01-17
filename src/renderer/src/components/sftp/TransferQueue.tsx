import { X, Check, Upload, Download } from 'lucide-react'
import { TransferProgress } from '@/types'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'

interface TransferQueueProps {
  transfers: TransferProgress[]
  onCancel: (transferId: string) => void
  onClearCompleted: () => void
}

export function TransferQueue({ transfers, onCancel, onClearCompleted }: TransferQueueProps) {
  if (transfers.length === 0) return null

  const hasCompleted = transfers.some(t => t.status === 'completed' || t.status === 'failed')

  return (
    <div className="border rounded-lg bg-card p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">Transfers</span>
        {hasCompleted && (
          <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={onClearCompleted}>
            Clear Completed
          </Button>
        )}
      </div>
      <div className="space-y-2 max-h-32 overflow-y-auto">
        {transfers.slice(-5).map((transfer) => (
          <div key={transfer.transfer_id} className="flex items-center gap-2">
            {transfer.status === 'uploading' && <Upload className="w-3 h-3 text-muted-foreground" />}
            {transfer.status === 'downloading' && <Download className="w-3 h-3 text-muted-foreground" />}
            {transfer.status === 'completed' && <Check className="w-3 h-3 text-green-500" />}
            <span className="text-xs truncate flex-1">{transfer.filename}</span>
            {transfer.status === 'completed' ? (
              <span className="text-xs text-green-500">Completed</span>
            ) : (
              <>
                <Progress value={transfer.percentage} className="w-24 h-2" />
                <span className="text-xs text-muted-foreground w-10">{transfer.percentage.toFixed(0)}%</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5"
                  onClick={() => onCancel(transfer.transfer_id)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
