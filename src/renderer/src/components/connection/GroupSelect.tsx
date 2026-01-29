import { useGroups } from '@/hooks'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface GroupSelectProps {
  value?: string
  onChange: (value: string) => void
}

export function GroupSelect({ value, onChange }: GroupSelectProps) {
  const { groups } = useGroups()

  return (
    <div className="space-y-2">
      <Label htmlFor="group">Group (Optional)</Label>
      <Select value={value || 'none'} onValueChange={(val) => onChange(val === 'none' ? '' : val)}>
        <SelectTrigger id="group">
          <SelectValue placeholder="No group" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">No group</SelectItem>
          {groups.map((group) => (
            <SelectItem key={group.id} value={group.name}>
              {group.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
