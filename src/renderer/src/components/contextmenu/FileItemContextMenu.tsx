import { useState } from 'react'
import { FolderOpen, Pencil, Trash2, Shield } from 'lucide-react'
import { FileInfo } from '@/types'
import { BaseContextMenu, ContextMenuAction } from './BaseContextMenu'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { PermissionModal } from '@/components/sftp/PermissionModal'

interface FileItemContextMenuProps {
  children: React.ReactNode
  file: FileInfo
  onOpen: () => void
  onRename: () => void
  onDelete: () => Promise<void>
  onChmod: (mode: number) => Promise<void>
}

export function FileItemContextMenu({
  children,
  file,
  onOpen,
  onRename,
  onDelete,
  onChmod,
}: FileItemContextMenuProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showPermissions, setShowPermissions] = useState(false)

  const actions: ContextMenuAction[] = [
    ...(file.is_dir ? [{ label: 'Open', icon: <FolderOpen className="w-4 h-4" />, onClick: onOpen }] : []),
    { label: 'Rename', icon: <Pencil className="w-4 h-4" />, onClick: onRename, separator: file.is_dir },
    { label: 'Edit Permissions', icon: <Shield className="w-4 h-4" />, onClick: () => setShowPermissions(true) },
    { label: 'Delete', icon: <Trash2 className="w-4 h-4" />, onClick: () => setShowDeleteConfirm(true), destructive: true, separator: true },
  ]

  return (
    <>
      <BaseContextMenu actions={actions}>{children}</BaseContextMenu>
      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title={file.is_dir ? "Delete folder" : "Delete file"}
        description={`Are you sure you want to delete "${file.name}"? This action cannot be undone.`}
        confirmText="Delete"
        destructive
        onConfirm={onDelete}
      />
      <PermissionModal
        open={showPermissions}
        onOpenChange={setShowPermissions}
        filename={file.name}
        currentMode={file.mode}
        isDir={file.is_dir}
        onSave={onChmod}
      />
    </>
  )
}
