import { Pencil, Trash2 } from 'lucide-react'
import { BaseContextMenu, ContextMenuAction } from './BaseContextMenu'
import { Group } from '@/types'

interface GroupCardContextMenuProps {
  children: React.ReactNode
  group: Group
  onEdit: () => void
  onDelete: () => void
}

export function GroupCardContextMenu({
  children,
  group,
  onEdit,
  onDelete
}: GroupCardContextMenuProps) {
  const actions: ContextMenuAction[] = [
    {
      label: 'Edit',
      icon: <Pencil className="w-4 h-4" />,
      onClick: onEdit
    },
    {
      label: 'Delete',
      icon: <Trash2 className="w-4 h-4" />,
      onClick: onDelete,
      separator: true,
      destructive: true
    }
  ]

  return <BaseContextMenu actions={actions}>{children}</BaseContextMenu>
}
