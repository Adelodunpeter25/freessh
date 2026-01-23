import { ThemeSettings } from '@/components/settings/ThemeSettings'

export function SettingsPage() {
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-border p-6">
        <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your application preferences
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl space-y-8">
          <ThemeSettings />
        </div>
      </div>
    </div>
  )
}
