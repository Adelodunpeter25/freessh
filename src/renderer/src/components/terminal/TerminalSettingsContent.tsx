import { useMemo, useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { useTerminalThemeStore } from '@/stores/terminalThemeStore'
import { terminalThemePresets } from '@/utils/terminalThemes'
import { TerminalFontSettings } from './TerminalFontSettings'
import { cn } from '@/lib/utils'

interface TerminalSettingsContentProps {
  // When set, the component acts as a theme picker instead of writing to the global store.
  themeName?: string
  onSelectTheme?: (name: string) => void
  onDone?: () => void
  showFontButton?: boolean
  includeGlobalOption?: boolean
}

export function TerminalSettingsContent({
  themeName: themeNameProp,
  onSelectTheme,
  onDone,
  showFontButton,
  includeGlobalOption = false,
}: TerminalSettingsContentProps = {}) {
  const [showFontSettings, setShowFontSettings] = useState(false)
  const storeThemeName = useTerminalThemeStore((state) => state.themeName)
  const setStoreTheme = useTerminalThemeStore((state) => state.setTheme)

  const isPicker = typeof onSelectTheme === 'function'
  const themeName = isPicker ? (themeNameProp ?? '') : storeThemeName
  const shouldShowFontButton = showFontButton ?? !isPicker

  const darkThemes = useMemo(() => terminalThemePresets.filter((p) => !p.isLight), [])
  const lightThemes = useMemo(() => terminalThemePresets.filter((p) => p.isLight), [])

  const selectTheme = (name: string) => {
    if (isPicker) {
      onSelectTheme?.(name)
      onDone?.()
      return
    }
    setStoreTheme(name)
  }

  if (showFontSettings && shouldShowFontButton) {
    return <TerminalFontSettings onBack={() => setShowFontSettings(false)} />
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 pb-9 space-y-6">
      {shouldShowFontButton && (
        <button
          onClick={() => setShowFontSettings(true)}
          className="w-full flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent transition-colors"
        >
          <span className="text-sm font-medium">Font</span>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </button>
      )}

      {isPicker && includeGlobalOption && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">Override</h3>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => selectTheme('')}
              className={cn(
                "flex flex-col gap-1.5 p-2 rounded-lg border transition-all text-left",
                themeName === ''
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-muted-foreground"
              )}
            >
              <div className="h-8 w-full rounded flex items-center px-2 text-xs font-mono bg-muted text-foreground">
                ~/ssh
              </div>
              <span className="text-xs truncate">Use global theme</span>
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground">Dark Themes</h3>
        <div className="grid grid-cols-2 gap-2">
          {darkThemes.map((preset) => (
            <button
              key={preset.name}
              onClick={() => selectTheme(preset.name)}
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
              onClick={() => selectTheme(preset.name)}
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
