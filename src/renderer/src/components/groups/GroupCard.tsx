import { memo } from 'react'
import { Folder, Pencil } from 'lucide-react'
import { Group } from '@/types'
import { GroupCardContextMenu } from '@/components/contextmenu'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface GroupCardProps {
  group: Group
  selected: boolean
  onSelect: (group: Group | null) => void
  onEdit: (group: Group) => void
  onDelete: (id: string) => void
  onOpen: (group: Group) => void
}

export const GroupCard = memo(function GroupCard({ 
  group, 
  selected, 
  onSelect, 
  onEdit, 
  onDelete,
  onOpen
}: GroupCardProps) {
  return (
    <GroupCardContextMenu
      group={group}
      onEdit={() => onEdit(group)}
      onDelete={() => onDelete(group.id)}
    >
      <div
        className={`group flex items-center gap-4 p-4 rounded-xl border transition-all select-none animate-scale-in ${
          selected 
            ? 'bg-card border-primary/50 shadow-[0_0_0_1px_hsl(var(--primary)/0.5)] cursor-pointer' 
            : 'bg-card border-border hover:border-primary/30 shadow-sm hover:shadow-md cursor-pointer'
        }`}
        onClick={(e) => {
          e.stopPropagation()
        }}
        onContextMenu={(e) => {
          e.stopPropagation()
          onSelect(group)
        }}
        onDoubleClick={() => {
          onOpen(group)
        }}
      >
        <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
          <Folder className="h-5 w-5 text-primary" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-foreground truncate">{group.name}</h3>
          <p className="text-xs text-muted-foreground truncate">
            {group.connection_count} {group.connection_count === 1 ? 'connection' : 'connections'}
          </p>
        </div>

        <TooltipProvider delayDuration={150}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="opacity-0 group-hover:opacity-100 h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit(group)
                }}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Edit group</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </GroupCardContextMenu>
  )
})
