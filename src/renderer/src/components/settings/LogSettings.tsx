import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useLogSettings } from '@/hooks/settings'

export function LogSettings() {
  const { settings, loading, setAutoLogging } = useLogSettings()

  if (loading) return null

  const autoLogging = settings.auto_logging ? 'enabled' : 'disabled'

  const handleChange = (value: 'enabled' | 'disabled') => {
    setAutoLogging(value === 'enabled')
  }

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

