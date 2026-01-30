import { ReactNode } from 'react'
import { Snippet } from '@/types/snippet'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import { Eye, Edit, Trash2 } from 'lucide-react'

interface SnippetsContextMenuProps {
  snippet: Snippet
  onView?: () => void
  onEdit?: () => void
  onDelete?: () => void
  children: ReactNode
}

export function SnippetsContextMenu({
  snippet,
  onView,
  onEdit,
  onDelete,
  children
}: SnippetsContextMenuProps) {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        {onView && (
          <ContextMenuItem onClick={onView}>
            <Eye className="h-4 w-4 mr-2" />
            View Command
          </ContextMenuItem>
        )}
        {onEdit && (
          <ContextMenuItem onClick={onEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </ContextMenuItem>
        )}
        {onDelete && (
          <ContextMenuItem
            onClick={onDelete}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </ContextMenuItem>
        )}
      </ContextMenuContent>
    </ContextMenu>
  )
}
