import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ExportTab } from './ExportTab'
import { ImportTab } from './ImportTab'

interface ExportImportDialogProps {
  isOpen: boolean
  onClose: () => void
}

export function ExportImportDialog({ isOpen, onClose }: ExportImportDialogProps) {
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export')

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Export / Import</DialogTitle>
          <DialogDescription>
            Export your connections to backup or import from other sources
          </DialogDescription>
        </DialogHeader>

        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('export')}
            className={`flex-1 px-4 py-2.5 text-sm font-medium transition-colors ${
              activeTab === 'export'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Export
          </button>
          <button
            onClick={() => setActiveTab('import')}
            className={`flex-1 px-4 py-2.5 text-sm font-medium transition-colors ${
              activeTab === 'import'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Import
          </button>
        </div>

        <div className="min-h-[300px]">
          {activeTab === 'export' ? <ExportTab /> : <ImportTab />}
        </div>
      </DialogContent>
    </Dialog>
  )
}
