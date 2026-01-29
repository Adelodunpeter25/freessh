import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { useLogSettings } from '@/hooks/settings'
import { useLogs } from '@/hooks/logs'
import { useState } from 'react'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { Trash2 } from 'lucide-react'

export function LogSettings() {
  const { settings, loading, setAutoLogging } = useLogSettings()
  const { deleteAllLogs } = useLogs()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  if (loading) return null

  const autoLogging = settings.auto_logging ? 'enabled' : 'disabled'

  const handleChange = (value: 'enabled' | 'disabled') => {
    setAutoLogging(value === 'enabled')
  }

  const handleDeleteAll = async () => {
    await deleteAllLogs()
    setShowDeleteConfirm(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <label className="text-sm font-medium">Auto-logging</label>
          <p className="text-sm text-muted-foreground">Automatically record all terminal sessions</p>
        </div>
        <Select value={autoLogging} onValueChange={handleChange}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="enabled">Enabled</SelectItem>
            <SelectItem value="disabled">Disabled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="pt-4 border-t">
        <Button 
          variant="destructive" 
          onClick={() => setShowDeleteConfirm(true)}
          className="w-full"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete All Logs
        </Button>
      </div>

      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Delete All Logs"
        description="Are you sure you want to delete all log files? This action cannot be undone and all recorded terminal sessions will be permanently deleted."
        onConfirm={handleDeleteAll}
      />
    </div>
  )
}

