import { useState } from 'react'
import { useExport } from '@/hooks'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Download } from 'lucide-react'

export function ExportTab() {
  const { exporting, exportFreeSSH, exportOpenSSH } = useExport()
  const [format, setFormat] = useState<'freessh' | 'openssh'>('freessh')

  const handleExport = async () => {
    if (format === 'freessh') {
      await exportFreeSSH()
    } else if (format === 'openssh') {
      await exportOpenSSH()
    }
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <div>
        <Label className="text-sm font-medium mb-2 block">Export Format</Label>
        <div className="space-y-2">
          <div className={`flex items-center gap-2 p-3 border rounded-lg ${format === 'freessh' ? 'bg-muted/50' : ''}`}>
            <input
              type="radio"
              id="format-freessh"
              name="format"
              value="freessh"
              checked={format === 'freessh'}
              onChange={(e) => setFormat(e.target.value as 'freessh')}
              className="w-4 h-4"
            />
            <label htmlFor="format-freessh" className="flex-1 cursor-pointer">
              <div className="font-medium">FreeSSH Format</div>
              <div className="text-xs text-muted-foreground">
                Export all connections, groups, port forwards, and keys to JSON
              </div>
            </label>
          </div>

          <div className={`flex items-center gap-2 p-3 border rounded-lg ${format === 'openssh' ? 'bg-muted/50' : ''}`}>
            <input
              type="radio"
              id="format-openssh"
              name="format"
              value="openssh"
              checked={format === 'openssh'}
              onChange={(e) => setFormat(e.target.value as 'openssh')}
              className="w-4 h-4"
            />
            <label htmlFor="format-openssh" className="flex-1 cursor-pointer">
              <div className="font-medium">OpenSSH Config</div>
              <div className="text-xs text-muted-foreground">
                Export connections to OpenSSH config format (~/.ssh/config)
              </div>
            </label>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t">
        <Button onClick={handleExport} disabled={exporting}>
          <Download className="w-4 h-4 mr-2" />
          {exporting ? 'Exporting...' : 'Export'}
        </Button>
      </div>
    </div>
  )
}
