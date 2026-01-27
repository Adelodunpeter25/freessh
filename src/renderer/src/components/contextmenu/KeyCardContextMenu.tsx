import { Pencil, Trash2, Upload } from 'lucide-react'
import { BaseContextMenu, ContextMenuAction } from './BaseContextMenu'

interface KeyCardContextMenuProps {
  children: React.ReactNode
  onEdit: () => void
  onDelete: () => void
  onExport: () => void
}

export function KeyCardContextMenu({
  children,
  onEdit,
  onDelete,
  onExport,
}: KeyCardContextMenuProps) {
  const actions: ContextMenuAction[] = [
    { label: 'Edit', icon: <Pencil className="w-4 h-4" />, onClick: onEdit },
    { label: 'Export to Host', icon: <Upload className="w-4 h-4" />, onClick: onExport, separator: true },
    { label: 'Delete', icon: <Trash2 className="w-4 h-4" />, onClick: onDelete, destructive: true, separator: true },
  ]

  return <BaseContextMenu actions={actions}>{children}</BaseContextMenu>
}
