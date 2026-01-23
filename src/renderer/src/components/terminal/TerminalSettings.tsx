import { useState } from 'react'
import { X, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTerminalThemeStore } from '@/stores/terminalThemeStore'
import { terminalThemePresets } from '@/utils/terminalThemePresets'
import { TerminalFontSettings } from './TerminalFontSettings'
import { cn } from '@/lib/utils'

interface TerminalSettingsProps {
  onClose: () => void
}

export function TerminalSettings({ onClose }: TerminalSettingsProps) {
  const [showFontSettings, setShowFontSettings] = useState(false)
  const themeName = useTerminalThemeStore((state) => state.themeName)
  const setTheme = useTerminalThemeStore((state) => state.setTheme)

  const darkThemes = terminalThemePresets.filter((p) => !p.isLight)
  const lightThemes = terminalThemePresets.filter((p) => p.isLight)

  if (showFontSettings) {
    return (
      <div className="fixed right-0 top-14 bottom-0 w-80 bg-background border-l border-border shadow-lg z-50">
        <TerminalFontSettings onBack={() => setShowFontSettings(false)} />
      </div>
    )
  }

  return (
    <div className="fixed right-0 top-14 bottom-0 w-80 bg-background border-l border-border shadow-lg z-50 flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="text-lg font-semibold">Terminal Settings</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <button
          onClick={() => setShowFontSettings(true)}
          className="w-full flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent transition-colors"
        >
          <span className="text-sm font-medium">Font</span>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </button>

        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">Dark Themes</h3>
          <div className="grid grid-cols-2 gap-2">
            {darkThemes.map((preset) => (
              <button
                key={preset.name}
                onClick={() => setTheme(preset.name)}
                className={cn(
                  "flex flex-col gap-1.5 p-2 rounded-lg border transition-all text-left",
                  themeName === preset.name
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-muted-foreground"
                )}
              >
                <div
                  className="h-8 w-full rounded flex items-center px-2 text-xs font-mono"
                  style={{
                    backgroundColor: preset.theme.background,
                    color: preset.theme.foreground
                  }}
                >
                  ~/ssh
                </div>
                <span className="text-xs truncate">{preset.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">Light Themes</h3>
          <div className="grid grid-cols-2 gap-2">
            {lightThemes.map((preset) => (
              <button
                key={preset.name}
                onClick={() => setTheme(preset.name)}
                className={cn(
                  "flex flex-col gap-1.5 p-2 rounded-lg border transition-all text-left",
                  themeName === preset.name
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-muted-foreground"
                )}
              >
                <div
                  className="h-8 w-full rounded flex items-center px-2 text-xs font-mono"
                  style={{
                    backgroundColor: preset.theme.background,
                    color: preset.theme.foreground
                  }}
                >
                  ~/ssh
                </div>
                <span className="text-xs truncate">{preset.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
