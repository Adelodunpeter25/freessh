import { useState } from 'react'
import { FolderOpen, Pencil, Trash2 } from 'lucide-react'
import { FileInfo } from '@/types'
import { BaseContextMenu, ContextMenuAction } from './BaseContextMenu'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'

interface FileItemContextMenuProps {
  children: React.ReactNode
  file: FileInfo
  onOpen: () => void
  onRename: () => void
  onDelete: () => Promise<void>
}

export function FileItemContextMenu({
  children,
  file,
  onOpen,
  onRename,
  onDelete,
}: FileItemContextMenuProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const actions: ContextMenuAction[] = [
    ...(file.is_dir ? [{ label: 'Open', icon: <FolderOpen className="w-4 h-4" />, onClick: onOpen }] : []),
    { label: 'Rename', icon: <Pencil className="w-4 h-4" />, onClick: onRename, separator: file.is_dir },
    { label: 'Delete', icon: <Trash2 className="w-4 h-4" />, onClick: () => setShowDeleteConfirm(true), destructive: true, separator: true },
  ]

  return (
    <>
      <BaseContextMenu actions={actions}>{children}</BaseContextMenu>
      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Delete file"
        description={`Are you sure you want to delete "${file.name}"? This action cannot be undone.`}
        confirmText="Delete"
        destructive
        onConfirm={onDelete}
      />
    </>
  )
}
