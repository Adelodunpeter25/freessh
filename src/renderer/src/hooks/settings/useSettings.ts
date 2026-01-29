import { useState, useEffect } from 'react'
import { settingsService } from '@/services/ipc'
import { Settings } from '@/types/settings'
import { toast } from 'sonner'

export function useSettings() {
  const [settings, setSettings] = useState<Settings>({ auto_logging: false })
  const [loading, setLoading] = useState(true)

  const loadSettings = async () => {
    try {
      setLoading(true)
      const data = await settingsService.get()
      setSettings(data)
    } catch (error) {
      toast.error('Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  const updateSettings = (newSettings: Settings) => {
    setSettings(newSettings)
    settingsService.update(newSettings)
    toast.success('Settings updated')
  }

  const setAutoLogging = (enabled: boolean) => {
    updateSettings({ ...settings, auto_logging: enabled })
  }

  useEffect(() => {
    loadSettings()
  }, [])

  return { settings, loading, updateSettings, setAutoLogging }
}
