import { useState, useEffect } from 'react'
import { logSettingsService } from '@/services/ipc'
import { LogSettings } from '@/types/logSettings'
import { toast } from 'sonner'

export function useLogSettings() {
  const [settings, setSettings] = useState<LogSettings>({ auto_logging: false })
  const [loading, setLoading] = useState(true)

  const loadSettings = async () => {
    try {
      setLoading(true)
      const data = await logSettingsService.get()
      setSettings(data)
    } catch (error) {
      toast.error('Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  const updateSettings = (newSettings: LogSettings) => {
    setSettings(newSettings)
    try {
      logSettingsService.update(newSettings)
      toast.success('Settings updated')
    } catch (error) {
      toast.error('Failed to update settings')
    }
  }

  const setAutoLogging = (enabled: boolean) => {
    updateSettings({ ...settings, auto_logging: enabled })
  }

  useEffect(() => {
    loadSettings()
  }, [])

  return { settings, loading, updateSettings, setAutoLogging }
}
