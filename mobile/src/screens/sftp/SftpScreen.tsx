import { useCallback, useEffect, useMemo, useState } from 'react'
import { File } from 'expo-file-system'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { YStack } from 'tamagui'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'

import {
  SftpActionDialogs,
  SftpBrowser,
  SftpCopyFooter,
  SftpTabBar,
  SftpToolbar,
} from '@/components'
import { useSearch, useSftpActions } from '@/hooks'
import { useSftpStore, useSnackbarStore } from '@/stores'
import type { ConnectionsStackParamList } from '@/navigation/AppNavigator'
import type { FileInfo } from '@/types'
import { getSftpBreadcrumb } from '@/utils/sftp'
import { parentPath } from '@/utils/sftpPaths'

export function SftpScreen() {
  const insets = useSafeAreaInsets()
  const navigation = useNavigation<NativeStackNavigationProp<ConnectionsStackParamList>>()
  const sessions = useSftpStore((state) => state.sessions)
  const activeSessionId = useSftpStore((state) => state.activeSessionId)
  const setActiveSession = useSftpStore((state) => state.setActiveSession)
  const closeSession = useSftpStore((state) => state.closeSession)
  const closeAllSessions = useSftpStore((state) => state.closeAllSessions)
  const listDirectory = useSftpStore((state) => state.listDirectory)
  const openFolder = useSftpStore((state) => state.openFolder)
  const createFolder = useSftpStore((state) => state.createFolder)
  const renameEntry = useSftpStore((state) => state.renameEntry)
  const deleteEntries = useSftpStore((state) => state.deleteEntries)
  const copyEntries = useSftpStore((state) => state.copyEntries)
  const downloadEntries = useSftpStore((state) => state.downloadEntries)
  const uploadFiles = useSftpStore((state) => state.uploadFiles)
  const showSnackbar = useSnackbarStore((state) => state.show)

  const activeSession = useMemo(
    () => sessions.find((session) => session.id === activeSessionId) ?? null,
    [activeSessionId, sessions],
  )

  const files = activeSession?.files ?? []
  const currentPath = activeSession?.currentPath ?? '/'
  const loading = activeSession?.loading ?? false
  const connected = activeSession?.connected ?? false
  const connectionName = activeSession?.connectionName ?? null
  const error = activeSession?.error ?? null

  const {
    showHidden,
    toggleShowHidden,
    visibleFiles,
    selectedPaths,
    hasSelection,
    canSingleSelectAction,
    isSelected,
    toggleSelection,
    clearSelection,
  } = useSftpActions(files)

  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false)
  const [showRenameDialog, setShowRenameDialog] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [renameValue, setRenameValue] = useState('')
  const [copyMode, setCopyMode] = useState(false)
  const [pendingCopyPaths, setPendingCopyPaths] = useState<string[]>([])

  const { query, filtered, setQuery, clearQuery } = useSearch({
    items: visibleFiles,
    fields: ['name', 'path'],
  })

  useEffect(() => {
    return () => {
      closeAllSessions()
    }
  }, [closeAllSessions])

  const selectedEntries = useMemo(
    () => files.filter((file) => selectedPaths.includes(file.path)),
    [files, selectedPaths],
  )
  const singleSelectedEntry = selectedEntries.length === 1 ? selectedEntries[0] : null

  const { clickablePaths, canGoUp } = useMemo(
    () => getSftpBreadcrumb(currentPath, connectionName),
    [connectionName, currentPath],
  )

  const pinnedTabBarHeight = insets.top + 52
  const showSearchEmpty = connected && query.trim().length > 0 && filtered.length === 0

  const handleRefresh = useCallback(async () => {
    if (!activeSession) return
    try {
      await listDirectory(currentPath)
    } catch {
      showSnackbar('Failed to refresh folder', 'error')
    }
  }, [activeSession, currentPath, listDirectory, showSnackbar])

  const handleOpenFolder = useCallback(
    async (folder: FileInfo) => {
      try {
        await openFolder(folder.path)
      } catch {
        showSnackbar(`Failed to open "${folder.name}"`, 'error')
      }
    },
    [openFolder, showSnackbar],
  )

  const navigateToPath = useCallback(
    async (path: string) => {
      try {
        await openFolder(path)
      } catch {
        showSnackbar('Failed to navigate to path', 'error')
      }
    },
    [openFolder, showSnackbar],
  )

  const handleGoUp = useCallback(() => {
    void listDirectory(parentPath(currentPath))
  }, [currentPath, listDirectory])

  const handleBack = useCallback(() => {
    navigation.goBack()
  }, [navigation])

  const handleCloseSession = useCallback(
    (id: string) => {
      closeSession(id)
    },
    [closeSession],
  )

  const handleToggleSelect = useCallback(
    (entry: FileInfo) => {
      if (copyMode) return
      toggleSelection(entry.path)
    },
    [copyMode, toggleSelection],
  )

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

  return (
    <YStack gap="$0" flex={1} bg="$background">
      <YStack
        position="absolute"
        top={0}
        left={0}
        right={0}
        zIndex={20}
        pt={insets.top}
        bg="$background"
      >
        <SftpTabBar
          sessions={sessions}
          activeSessionId={activeSessionId}
          onBackPress={handleBack}
          onSelect={setActiveSession}
          onClose={handleCloseSession}
        />
      </YStack>

      <YStack flex={1} bg="$background" mt={pinnedTabBarHeight}>
        <SftpToolbar
          clickablePaths={clickablePaths}
          onNavigateTo={navigateToPath}
          query={query}
          onQueryChange={setQuery}
          onClearQuery={clearQuery}
          onUpload={handleUpload}
          showHidden={showHidden}
          onToggleShowHidden={toggleShowHidden}
          hasSelection={hasSelection}
          canSingleSelectAction={canSingleSelectAction}
          onNewFolder={handleNewFolder}
          onDelete={handleDelete}
          onCopy={handleCopy}
          onDownload={handleDownload}
          onRename={handleRename}
        />

        <SftpBrowser
          connected={connected}
          error={error}
          query={query}
          showSearchEmpty={showSearchEmpty}
          canGoUp={canGoUp}
          hasSelection={hasSelection}
          copyMode={copyMode}
          loading={loading}
          files={filtered}
          isSelected={isSelected}
          onClearSelection={clearSelection}
          onGoUp={handleGoUp}
          onRefresh={() => {
            void handleRefresh()
          }}
          onToggleSelect={handleToggleSelect}
          onOpenFolder={handleOpenFolder}
          onOpenFile={(file) => showSnackbar(`Selected "${file.name}"`, 'info')}
        />
      </YStack>

      {copyMode ? (
        <SftpCopyFooter
          itemCount={pendingCopyPaths.length}
          onCopyHere={() => {
            void handleCopyHere()
          }}
          onCancel={handleCancelCopy}
        />
      ) : null}

      <SftpActionDialogs
        showDeleteDialog={showDeleteDialog}
        onShowDeleteDialogChange={setShowDeleteDialog}
        selectedCount={selectedPaths.length}
        onConfirmDelete={handleConfirmDelete}
        showNewFolderDialog={showNewFolderDialog}
        onShowNewFolderDialogChange={setShowNewFolderDialog}
        newFolderName={newFolderName}
        onNewFolderNameChange={setNewFolderName}
        onCreateFolder={handleCreateFolder}
        showRenameDialog={showRenameDialog}
        onShowRenameDialogChange={setShowRenameDialog}
        renameValue={renameValue}
        onRenameValueChange={setRenameValue}
        onConfirmRename={handleConfirmRename}
        singleSelectedEntry={singleSelectedEntry}
      />
    </YStack>
  )
}
