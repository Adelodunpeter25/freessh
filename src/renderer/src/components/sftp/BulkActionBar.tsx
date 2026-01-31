import { Download, Trash2, X } from 'lucide-react'
import { Button } from '../ui/button'

interface BulkActionBarProps {
  selectedCount: number
  onDelete: () => void
  onDownload: () => void
  onClear: () => void
}

export const BulkActionBar = ({ selectedCount, onDelete, onDownload, onClear }: BulkActionBarProps) => {
  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 bg-background border rounded-lg shadow-lg px-4 py-2 flex items-center gap-3">
      <span className="text-sm font-medium">{selectedCount} selected</span>
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={onDownload}>
          <Download className="h-4 w-4 mr-1" />
          Download
        </Button>
        <Button size="sm" variant="destructive" onClick={onDelete}>
          <Trash2 className="h-4 w-4 mr-1" />
          Delete
        </Button>
      </div>
      <Button size="sm" variant="ghost" onClick={onClear}>
        <X className="h-4 w-4" />
      </Button>
    </div>
  )
}
