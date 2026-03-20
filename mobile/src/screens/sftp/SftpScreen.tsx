import { useCallback, useMemo } from 'react'
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
import { getSftpBreadcrumb } from '@/utils/sftp'
import { parentPath } from '@/utils/sftpPaths'
import { isTextFile } from '@/utils/file'
import { useSftpScreenActions } from './useSftpScreenActions'

export function SftpScreen() {
  const insets = useSafeAreaInsets()
  const navigation = useNavigation<NativeStackNavigationProp<ConnectionsStackParamList>>()
  const sessions = useSftpStore((state) => state.sessions)
  const activeSessionId = useSftpStore((state) => state.activeSessionId)
  const setActiveSession = useSftpStore((state) => state.setActiveSession)
  const closeSession = useSftpStore((state) => state.closeSession)
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

  const singleSelectedEntry = useMemo(() => {
    const selected = files.filter((file) => selectedPaths.includes(file.path))
    return selected.length === 1 ? selected[0] : null
  }, [files, selectedPaths])

  const actions = useSftpScreenActions({
    activeSessionExists: Boolean(activeSession),
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
  })

  const { query, filtered, setQuery, clearQuery } = useSearch({
    items: visibleFiles,
    fields: ['name', 'path'],
  })

  const { clickablePaths, canGoUp } = useMemo(
    () => getSftpBreadcrumb(currentPath, connectionName),
    [connectionName, currentPath],
  )

  const handleGoUp = useCallback(() => {
    void listDirectory(parentPath(currentPath))
  }, [currentPath, listDirectory])

  const handleBack = useCallback(() => {
    navigation.goBack()
  }, [navigation])

  const handleCloseSession = useCallback((id: string) => {
    closeSession(id)
  }, [closeSession])

  const pinnedTabBarHeight = insets.top + 52
  const showSearchEmpty = connected && query.trim().length > 0 && filtered.length === 0

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
          onNavigateTo={actions.navigateToPath}
          query={query}
          onQueryChange={setQuery}
          onClearQuery={clearQuery}
          onUpload={actions.handleUpload}
          showHidden={showHidden}
          onToggleShowHidden={toggleShowHidden}
          hasSelection={hasSelection}
          canSingleSelectAction={canSingleSelectAction}
          onNewFolder={actions.handleNewFolder}
          onDelete={actions.handleDelete}
          onCopy={actions.handleCopy}
          onDownload={actions.handleDownload}
          onRename={actions.handleRename}
        />

        <SftpBrowser
          connected={connected}
          error={error}
          query={query}
          showSearchEmpty={showSearchEmpty}
          canGoUp={canGoUp}
          hasSelection={hasSelection}
          copyMode={actions.copyMode}
          loading={loading}
          files={filtered}
          isSelected={isSelected}
          onClearSelection={clearSelection}
          onGoUp={handleGoUp}
          onRefresh={() => {
            void actions.handleRefresh()
          }}
          onToggleSelect={actions.handleToggleSelect}
          onOpenFolder={actions.handleOpenFolder}
          onOpenFile={(file) => {
            if (isTextFile(file.name)) {
              navigation.navigate('FilePreview', {
                path: file.path,
                name: file.name,
                size: file.size,
              })
            } else {
              showSnackbar(`Cannot preview binary or unrecognised file "${file.name}"`, 'info')
            }
          }}
        />
      </YStack>

      {actions.copyMode ? (
        <SftpCopyFooter
          itemCount={actions.pendingCopyPaths.length}
          onCopyHere={() => {
            void actions.handleCopyHere()
          }}
          onCancel={actions.handleCancelCopy}
        />
      ) : null}

      <SftpActionDialogs
        showDeleteDialog={actions.showDeleteDialog}
        onShowDeleteDialogChange={actions.setShowDeleteDialog}
        selectedCount={selectedPaths.length}
        onConfirmDelete={actions.handleConfirmDelete}
        showNewFolderDialog={actions.showNewFolderDialog}
        onShowNewFolderDialogChange={actions.setShowNewFolderDialog}
        newFolderName={actions.newFolderName}
        onNewFolderNameChange={actions.setNewFolderName}
        onCreateFolder={actions.handleCreateFolder}
        showRenameDialog={actions.showRenameDialog}
        onShowRenameDialogChange={actions.setShowRenameDialog}
        renameValue={actions.renameValue}
        onRenameValueChange={actions.setRenameValue}
        onConfirmRename={actions.handleConfirmRename}
        singleSelectedEntry={singleSelectedEntry}
      />
    </YStack>
  )
}
