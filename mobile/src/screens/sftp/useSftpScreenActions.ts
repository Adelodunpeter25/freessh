import { useCallback, useMemo, useState } from 'react'
import { File } from 'expo-file-system'
import type { FileInfo } from '@/types'

type SftpScreenActionsArgs = {
  activeSessionExists: boolean
  files: FileInfo[]
  currentPath: string
  selectedPaths: string[]
  hasSelection: boolean
  singleSelectedEntry: FileInfo | null
  clearSelection: () => void
  toggleSelection: (path: string) => void
  listDirectory: (path?: string) => Promise<void>
  openFolder: (path: string) => Promise<void>
  createFolder: (name: string, parentPath?: string) => Promise<void>
  renameEntry: (oldPath: string, newNameOrPath: string) => Promise<void>
  deleteEntries: (entries: Array<{ path: string; isDir: boolean }>) => Promise<void>
  copyEntries: (sourcePaths: string[], destinationDirectory?: string) => Promise<void>
  downloadEntries: (remotePaths: string[], localDirectory?: string) => Promise<string[]>
  uploadFiles: (localPaths: string[], remoteDirectory?: string) => Promise<void>
  showSnackbar: (message: string, type?: 'success' | 'error' | 'info') => void
}

export function useSftpScreenActions({
  activeSessionExists,
  files,
  currentPath,
  selectedPaths,
  hasSelection,
  singleSelectedEntry,
  clearSelection,
  toggleSelection,
  listDirectory,
  openFolder,
  createFolder,
  renameEntry,
  deleteEntries,
  copyEntries,
  downloadEntries,
  uploadFiles,
  showSnackbar,
}: SftpScreenActionsArgs) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false)
  const [showRenameDialog, setShowRenameDialog] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [renameValue, setRenameValue] = useState('')
  const [copyMode, setCopyMode] = useState(false)
  const [pendingCopyPaths, setPendingCopyPaths] = useState<string[]>([])

  const selectedEntries = useMemo(
    () => files.filter((file) => selectedPaths.includes(file.path)),
    [files, selectedPaths],
  )

  const handleRefresh = useCallback(async () => {
    if (!activeSessionExists) return
    try {
      await listDirectory(currentPath)
    } catch {
      showSnackbar('Failed to refresh folder', 'error')
    }
  }, [activeSessionExists, currentPath, listDirectory, showSnackbar])

  const handleOpenFolder = useCallback(async (folder: FileInfo) => {
    try {
      await openFolder(folder.path)
    } catch {
      showSnackbar(`Failed to open "${folder.name}"`, 'error')
    }
  }, [openFolder, showSnackbar])

  const navigateToPath = useCallback(async (path: string) => {
    try {
      await openFolder(path)
    } catch {
      showSnackbar('Failed to navigate to path', 'error')
    }
  }, [openFolder, showSnackbar])

  const handleToggleSelect = useCallback((entry: FileInfo) => {
    if (copyMode) return
    toggleSelection(entry.path)
  }, [copyMode, toggleSelection])

  const handleNewFolder = useCallback(() => {
    setNewFolderName('')
    setShowNewFolderDialog(true)
  }, [])

  const handleDelete = useCallback(() => {
    if (!hasSelection) return
    setShowDeleteDialog(true)
  }, [hasSelection])

  const handleCopy = useCallback(() => {
    if (!hasSelection) return
    setPendingCopyPaths(selectedPaths)
    setCopyMode(true)
    clearSelection()
    showSnackbar('Choose a destination folder, then tap Copy here', 'info')
  }, [clearSelection, hasSelection, selectedPaths, showSnackbar])

  const handleCancelCopy = useCallback(() => {
    setCopyMode(false)
    setPendingCopyPaths([])
  }, [])

  const handleCopyHere = useCallback(async () => {
    if (!pendingCopyPaths.length) return
    try {
      await copyEntries(pendingCopyPaths, currentPath)
      showSnackbar(`Copied ${pendingCopyPaths.length} item(s)`, 'success')
      setCopyMode(false)
      setPendingCopyPaths([])
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Copy failed'
      showSnackbar(message, 'error')
    }
  }, [copyEntries, currentPath, pendingCopyPaths, showSnackbar])

  const handleDownload = useCallback(async () => {
    if (!hasSelection) return
    try {
      const outputs = await downloadEntries(selectedPaths)
      showSnackbar(`Downloaded ${outputs.length} item(s)`, 'success')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Download failed'
      showSnackbar(message, 'error')
    }
  }, [downloadEntries, hasSelection, selectedPaths, showSnackbar])

  const handleRename = useCallback(() => {
    if (!singleSelectedEntry) return
    setRenameValue(singleSelectedEntry.name)
    setShowRenameDialog(true)
  }, [singleSelectedEntry])

  const handleUpload = useCallback(async () => {
    try {
      const picked = await File.pickFileAsync()
      const list = Array.isArray(picked) ? picked : [picked]
      const localPaths = list.map((item) => item.uri)
      await uploadFiles(localPaths, currentPath)
      showSnackbar(`Uploaded ${localPaths.length} file(s)`, 'success')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Upload failed'
      showSnackbar(message, 'error')
    }
  }, [currentPath, showSnackbar, uploadFiles])

  const handleConfirmDelete = useCallback(() => {
    void (async () => {
      try {
        await deleteEntries(selectedEntries.map((entry) => ({ path: entry.path, isDir: entry.is_dir })))
        clearSelection()
        showSnackbar('Deleted selected item(s)', 'success')
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Delete failed'
        showSnackbar(message, 'error')
      }
    })()
  }, [clearSelection, deleteEntries, selectedEntries, showSnackbar])

  const handleCreateFolder = useCallback(() => {
    void (async () => {
      const name = newFolderName.trim()
      if (!name) return
      try {
        await createFolder(name, currentPath)
        showSnackbar(`Folder "${name}" created`, 'success')
        setShowNewFolderDialog(false)
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to create folder'
        showSnackbar(message, 'error')
      }
    })()
  }, [createFolder, currentPath, newFolderName, showSnackbar])

  const handleConfirmRename = useCallback(() => {
    void (async () => {
      if (!singleSelectedEntry) return
      const nextName = renameValue.trim()
      if (!nextName) return
      try {
        await renameEntry(singleSelectedEntry.path, nextName)
        clearSelection()
        showSnackbar('Renamed successfully', 'success')
        setShowRenameDialog(false)
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Rename failed'
        showSnackbar(message, 'error')
      }
    })()
  }, [clearSelection, renameEntry, renameValue, showSnackbar, singleSelectedEntry])

  return {
    showDeleteDialog,
    setShowDeleteDialog,
    showNewFolderDialog,
    setShowNewFolderDialog,
    showRenameDialog,
    setShowRenameDialog,
    newFolderName,
    setNewFolderName,
    renameValue,
    setRenameValue,
    copyMode,
    pendingCopyPaths,
    handleRefresh,
    handleOpenFolder,
    navigateToPath,
    handleToggleSelect,
    handleNewFolder,
    handleDelete,
    handleCopy,
    handleCancelCopy,
    handleCopyHere,
    handleDownload,
    handleRename,
    handleUpload,
    handleConfirmDelete,
    handleCreateFolder,
    handleConfirmRename,
  }
}
