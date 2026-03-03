import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ConnectionConfig } from '@/types'
import { CUSTOM_TERM_VALUE, DEFAULT_TERM_VALUE, isKnownTermValue, TERM_DEFAULTS } from '@/utils/termDefaults'

interface ConnectionFormProfileProps {
  formData: Partial<ConnectionConfig>
  onChange: (data: Partial<ConnectionConfig>) => void
}

export function ConnectionFormProfile({ formData, onChange }: ConnectionFormProfileProps) {
  const profile = formData.profile || {}
  const selectedTerm = profile.term || ''
  const termSelectValue =
    selectedTerm === ''
      ? DEFAULT_TERM_VALUE
      : isKnownTermValue(selectedTerm)
        ? selectedTerm
        : CUSTOM_TERM_VALUE

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-foreground">Profile</h3>

      <div className="space-y-2">
        <p className="text-xs text-muted-foreground">TERM</p>
        <Select
          value={termSelectValue}
          onValueChange={(value) =>
            onChange({
              ...formData,
              profile: {
                ...profile,
                term: value === DEFAULT_TERM_VALUE ? '' : value === CUSTOM_TERM_VALUE ? selectedTerm : value,
              },
            })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select TERM value" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={DEFAULT_TERM_VALUE}>Default (backend fallback)</SelectItem>
            {TERM_DEFAULTS.map((term) => (
              <SelectItem key={term} value={term}>
                {term}
              </SelectItem>
            ))}
            <SelectItem value={CUSTOM_TERM_VALUE}>Custom value</SelectItem>
          </SelectContent>
        </Select>
        {termSelectValue === CUSTOM_TERM_VALUE && (
          <Input
            value={selectedTerm}
            onChange={(e) =>
              onChange({
                ...formData,
                profile: { ...profile, term: e.target.value },
              })
            }
            placeholder="Enter custom TERM"
          />
        )}
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
