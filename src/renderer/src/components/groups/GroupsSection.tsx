import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { GroupList } from './GroupList'
import { NewGroupButton } from './NewGroupButton'
import { Group } from '@/types'
import { Button } from '@/components/ui/button'

interface GroupsSectionProps {
  groups: Group[]
  selectedGroupId: string | null
  onSelectGroup: (group: Group) => void
  onEditGroup: (group: Group) => void
  onDeleteGroup: (id: string) => void
  onNewGroup: () => void
}

export function GroupsSection({ 
  groups, 
  selectedGroupId, 
  onSelectGroup, 
  onEditGroup, 
  onDeleteGroup,
  onNewGroup 
}: GroupsSectionProps) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="border-b bg-background/95">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setCollapsed(!collapsed)}
            >
              {collapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
            <h2 className="text-sm font-semibold text-foreground">
              Groups {groups.length > 0 && `(${groups.length})`}
            </h2>
          </div>
          <NewGroupButton onClick={onNewGroup} />
        </div>

        {!collapsed && (
          <GroupList
            groups={groups}
            selectedGroupId={selectedGroupId}
            onSelect={onSelectGroup}
            onEdit={onEditGroup}
            onDelete={onDeleteGroup}
          />
        )}
      </div>
    </div>
  )
}
