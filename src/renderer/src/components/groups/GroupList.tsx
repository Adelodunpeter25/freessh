import { GroupCard } from './GroupCard'
import { Group } from '@/types'

interface GroupListProps {
  groups: Group[]
  selectedGroupId: string | null
  onSelect: (group: Group | null) => void
  onEdit: (group: Group) => void
  onDelete: (id: string) => void
}

export function GroupList({ 
  groups, 
  selectedGroupId, 
  onSelect, 
  onEdit, 
  onDelete 
}: GroupListProps) {
  if (groups.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-sm text-muted-foreground">No groups yet</p>
        <p className="text-xs text-muted-foreground mt-1">Create a group to organize your connections</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3" onClick={() => onSelect(null)}>
      {groups.map((group) => (
        <GroupCard
          key={group.id}
          group={group}
          selected={selectedGroupId === group.id}
          onSelect={onSelect}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}
