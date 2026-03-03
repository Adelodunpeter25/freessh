import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ConnectionConfig } from '@/types'

interface ConnectionFormProfileProps {
  formData: Partial<ConnectionConfig>
  onChange: (data: Partial<ConnectionConfig>) => void
}

export function ConnectionFormProfile({ formData, onChange }: ConnectionFormProfileProps) {
  const profile = formData.profile || {}

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-foreground">Profile</h3>

      <div className="space-y-2">
        <p className="text-xs text-muted-foreground">TERM</p>
        <Input
          value={profile.term || ''}
          onChange={(e) =>
            onChange({
              ...formData,
              profile: { ...profile, term: e.target.value },
            })
          }
          placeholder="xterm-256color"
        />
      </div>

      <div className="space-y-2">
        <p className="text-xs text-muted-foreground">Font size</p>
        <Input
          type="number"
          min={0}
          value={profile.font_size ?? ''}
          onChange={(e) =>
            onChange({
              ...formData,
              profile: {
                ...profile,
                font_size: e.target.value === '' ? undefined : Number(e.target.value),
              },
            })
          }
          placeholder="14"
        />
      </div>

      <div className="space-y-2">
        <p className="text-xs text-muted-foreground">Startup command</p>
        <Textarea
          value={profile.startup_command || ''}
          onChange={(e) =>
            onChange({
              ...formData,
              profile: { ...profile, startup_command: e.target.value },
            })
          }
          rows={4}
          placeholder="source ~/.bashrc"
        />
      </div>

      <div className="space-y-2">
        <p className="text-xs text-muted-foreground">Startup delay (ms)</p>
        <Input
          type="number"
          min={0}
          max={60000}
          value={profile.startup_command_delay_ms ?? ''}
          onChange={(e) =>
            onChange({
              ...formData,
              profile: {
                ...profile,
                startup_command_delay_ms: e.target.value === '' ? undefined : Number(e.target.value),
              },
            })
          }
          placeholder="0"
        />
      </div>
    </div>
  )
}
