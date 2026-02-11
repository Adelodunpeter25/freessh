import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { GroupList } from './GroupList'
import { Group } from '@/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'

interface GroupsSectionProps {
  groups: Group[]
  loading: boolean
  selectedGroupId: string | null
  onSelectGroup: (group: Group | null) => void
  onEditGroup: (group: Group) => void
  onDeleteGroup: (id: string) => void
  onOpenGroup: (group: Group) => void
}

export function GroupsSection({ 
  groups,
  loading,
  selectedGroupId, 
  onSelectGroup, 
  onEditGroup, 
  onDeleteGroup,
  onOpenGroup
}: GroupsSectionProps) {
  const [collapsed, setCollapsed] = useState(false)

  if (loading) {
    return (
      <div className="bg-background/95">
        <div className="px-4 py-3 flex items-center justify-center">
          <LoadingSpinner size="sm" />
        </div>
      </div>
    )
  }

  if (groups.length === 0) {
    return null
  }

  return (
    <div className="bg-background/95">
      <div className="px-4 py-3">
        <div className="flex items-center gap-2 mb-3">
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
            Groups
          </h2>
          <Badge variant="secondary">{groups.length}</Badge>
        </div>

        {!collapsed && (
          <GroupList
            groups={groups}
            selectedGroupId={selectedGroupId}
            onSelect={onSelectGroup}
            onEdit={onEditGroup}
            onDelete={onDeleteGroup}
            onOpen={onOpenGroup}
          />
        )}
      </div>
    </div>
  )
}
