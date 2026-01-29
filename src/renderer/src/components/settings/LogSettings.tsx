import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useState, useEffect } from 'react'
import { settingsService } from '@/services/ipc'
import { toast } from 'sonner'

export function LogSettings() {
  const [autoLogging, setAutoLogging] = useState<'enabled' | 'disabled'>('disabled')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await settingsService.get()
        setAutoLogging(settings.auto_logging ? 'enabled' : 'disabled')
      } catch (error) {
        toast.error('Failed to load settings')
      } finally {
        setLoading(false)
      }
    }
    loadSettings()
  }, [])

  const handleChange = (value: 'enabled' | 'disabled') => {
    setAutoLogging(value)
    settingsService.update({ auto_logging: value === 'enabled' })
    toast.success('Settings updated')
  }

  if (loading) return null

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium">Logging</h3>
        <p className="text-sm text-muted-foreground">Configure session logging behavior</p>
      </div>

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
    </div>
  )
}

