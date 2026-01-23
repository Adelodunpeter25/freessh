import { Input } from '@/components/ui/input'
import { ConnectionConfig } from '@/types'

interface ConnectionFormGeneralProps {
  formData: Partial<ConnectionConfig>
  onChange: (data: Partial<ConnectionConfig>) => void
}

export function ConnectionFormGeneral({ formData, onChange }: ConnectionFormGeneralProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-foreground">General</h3>
      <Input
        value={formData.name}
        onChange={(e) => onChange({ ...formData, name: e.target.value })}
        placeholder="Connection Name"
        required
      />

      <Input
        value={formData.group || ''}
        onChange={(e) => onChange({ ...formData, group: e.target.value || undefined })}
        placeholder="Group (optional)"
      />

      <Input
        value={formData.host}
        onChange={(e) => onChange({ ...formData, host: e.target.value })}
        placeholder="Host"
        required
      />

      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground whitespace-nowrap">SSH on</span>
        <Input
          type="number"
          value={formData.port}
          onChange={(e) => onChange({ ...formData, port: parseInt(e.target.value) })}
          className="w-24"
          required
        />
        <span className="text-sm text-muted-foreground">port</span>
      </div>
    </div>
  )
}
