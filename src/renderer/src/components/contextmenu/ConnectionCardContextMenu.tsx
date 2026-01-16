import { useState } from 'react'
import { Terminal, FolderOpen, Pencil, Trash2 } from 'lucide-react'
import { ConnectionConfig } from '@/types'
import { BaseContextMenu, ContextMenuAction } from './BaseContextMenu'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'

interface ConnectionCardContextMenuProps {
  children: React.ReactNode
  connection: ConnectionConfig
  onConnect: () => void
  onOpenSFTP: () => void
  onEdit: () => void
  onDelete: () => Promise<void>
}

export function ConnectionCardContextMenu({
  children,
  connection,
  onConnect,
  onOpenSFTP,
  onEdit,
  onDelete,
}: ConnectionCardContextMenuProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const actions: ContextMenuAction[] = [
    { label: 'Connect', icon: <Terminal className="w-4 h-4" />, onClick: onConnect },
    { label: 'Open SFTP', icon: <FolderOpen className="w-4 h-4" />, onClick: onOpenSFTP },
    { label: 'Edit', icon: <Pencil className="w-4 h-4" />, onClick: onEdit, separator: true },
    { label: 'Delete', icon: <Trash2 className="w-4 h-4" />, onClick: () => setShowDeleteConfirm(true), destructive: true, separator: true },
  ]

  return (
    <>
      <BaseContextMenu actions={actions}>{children}</BaseContextMenu>
      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Delete connection"
        description={`Are you sure you want to delete "${connection.name}"? This action cannot be undone.`}
        confirmText="Delete"
        destructive
        onConfirm={onDelete}
      />
    </>
  )
}
