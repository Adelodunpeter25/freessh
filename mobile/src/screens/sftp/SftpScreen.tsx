import { useCallback, useEffect, useMemo, useState } from 'react'
import { Pressable, RefreshControl, ScrollView } from 'react-native'
import { File } from 'expo-file-system'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Dialog, Text, XStack, YStack } from 'tamagui'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'

import { Button, ConfirmDialog, EmptyState, FileList, Input, SearchEmptyState, SftpTabBar, SftpToolbar } from '@/components'
import { useSearch, useSftpActions } from '@/hooks'
import { useSftpStore, useSnackbarStore } from '@/stores'
import type { FileInfo } from '@/types'
import type { ConnectionsStackParamList } from '@/navigation/AppNavigator'
import { getSftpBreadcrumb } from '@/utils/sftp'

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
    [sessions, activeSessionId],
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
  const { query, filtered, setQuery, clearQuery } = useSearch({
    items: visibleFiles,
    fields: ['name', 'path'],
  })

  useEffect(() => {
    return () => {
      closeAllSessions()
    }
  }, [closeAllSessions])

  const handleRefresh = useCallback(async () => {
    if (!activeSession) return
    try {
      await listDirectory(currentPath)
    } catch {
      showSnackbar('Failed to refresh folder', 'error')
    }
  }, [activeSession, currentPath, listDirectory, showSnackbar])

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

  const { clickablePaths, canGoUp } = useMemo(
    () => getSftpBreadcrumb(currentPath, connectionName),
    [currentPath, connectionName],
  )
  const handleGoUp = useCallback(() => {
    const segments = currentPath.split('/').filter(Boolean)
    const parent = segments.length > 1 ? `/${segments.slice(0, -1).join('/')}` : '/'
    void listDirectory(parent)
  }, [currentPath, listDirectory])
  const handleBack = useCallback(() => {
    navigation.goBack()
  }, [navigation])
  const handleCloseSession = useCallback((id: string) => {
    closeSession(id)
  }, [closeSession])
  const handleToggleSelect = useCallback((entry: FileInfo) => {
    toggleSelection(entry.path)
  }, [toggleSelection])
  const selectedEntries = useMemo(
    () => files.filter((file) => selectedPaths.includes(file.path)),
    [files, selectedPaths],
  )
  const singleSelectedEntry = selectedEntries.length === 1 ? selectedEntries[0] : null
  const handleNewFolder = useCallback(() => {
    setNewFolderName('')
    setShowNewFolderDialog(true)
  }, [])
  const handleDelete = useCallback(() => {
    if (!hasSelection) return
    setShowDeleteDialog(true)
  }, [hasSelection])
  const handleCopy = useCallback(async () => {
    if (!hasSelection) return
    try {
      await copyEntries(selectedPaths, currentPath)
      showSnackbar(`Copied ${selectedPaths.length} item(s)`, 'success')
      clearSelection()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Copy failed'
      showSnackbar(message, 'error')
    }
  }, [clearSelection, copyEntries, currentPath, hasSelection, selectedPaths, showSnackbar])
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

        {!connected ? (
          <YStack p="$4">
            <EmptyState
              title="No SFTP connection"
              description={error ?? 'Connect to a host to browse files.'}
            />
          </YStack>
        ) : showSearchEmpty ? (
          <YStack
            mx="$2"
            mt="$2"
            borderWidth={1}
            borderColor="$borderColor"
            borderRadius={16}
            overflow="hidden"
            bg="$background"
            p="$4"
          >
            <SearchEmptyState query={query} />
          </YStack>
        ) : (
          <YStack
            flex={1}
            mx="$2"
            mt="$2"
            mb="$3"
            borderWidth={1}
            borderColor="$borderColor"
            borderRadius={16}
            overflow="hidden"
            bg="$background"
          >
            {canGoUp ? (
              <Pressable onPress={handleGoUp}>
                <XStack
                  px="$3"
                  minHeight={56}
                  py="$2"
                  borderBottomWidth={1}
                  borderBottomColor="$borderColor"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Text color="$color" fontSize={14} fontWeight="600">
                    ..
                  </Text>
                  {hasSelection ? (
                    <Text
                      color="$accent"
                      fontSize={12}
                      fontWeight="600"
                      onPress={(event) => {
                        event.stopPropagation()
                        clearSelection()
                      }}
                    >
                      Clear selection
                    </Text>
                  ) : null}
                </XStack>
              </Pressable>
            ) : null}
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{ paddingBottom: 16 }}
              refreshControl={
                <RefreshControl refreshing={loading} onRefresh={handleRefresh} />
              }
            >
              <FileList
                files={filtered}
                hasSelection={hasSelection}
                isSelected={isSelected}
                onToggleSelect={handleToggleSelect}
                onOpenFolder={handleOpenFolder}
                onOpenFile={(file) => showSnackbar(`Selected "${file.name}"`, 'info')}
              />
            </ScrollView>
          </YStack>
        )}
      </YStack>

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete selected items?"
        description={`This will permanently delete ${selectedPaths.length} item(s).`}
        destructive
        confirmText="Delete"
        onConfirm={() => {
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
        }}
      />

      <Dialog open={showNewFolderDialog} onOpenChange={setShowNewFolderDialog}>
        <Dialog.Portal>
          <Dialog.Overlay opacity={0.5} backgroundColor="$shadowColor" />
          <Dialog.Content
            bordered
            elevate
            borderRadius="$4"
            padding="$4"
            backgroundColor="$background"
            width="85%"
            maxWidth={420}
          >
            <YStack gap="$3">
              <Dialog.Title>
                <Text fontSize={18} fontWeight="700" color="$color">
                  New folder
                </Text>
              </Dialog.Title>
              <Input
                placeholder="Folder name"
                value={newFolderName}
                onChangeText={setNewFolderName}
              />
              <XStack gap="$2" justifyContent="flex-end">
                <Button onPress={() => setShowNewFolderDialog(false)} bg="$background">
                  <Text color="$color">Cancel</Text>
                </Button>
                <Button
                  onPress={() => {
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
                  }}
                >
                  <Text color="$accentText">Create</Text>
                </Button>
              </XStack>
            </YStack>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog>

      <Dialog open={showRenameDialog} onOpenChange={setShowRenameDialog}>
        <Dialog.Portal>
          <Dialog.Overlay opacity={0.5} backgroundColor="$shadowColor" />
          <Dialog.Content
            bordered
            elevate
            borderRadius="$4"
            padding="$4"
            backgroundColor="$background"
            width="85%"
            maxWidth={420}
          >
            <YStack gap="$3">
              <Dialog.Title>
                <Text fontSize={18} fontWeight="700" color="$color">
                  Rename
                </Text>
              </Dialog.Title>
              <Input
                placeholder="New name"
                value={renameValue}
                onChangeText={setRenameValue}
              />
              <XStack gap="$2" justifyContent="flex-end">
                <Button onPress={() => setShowRenameDialog(false)} bg="$background">
                  <Text color="$color">Cancel</Text>
                </Button>
                <Button
                  onPress={() => {
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
                  }}
                >
                  <Text color="$accentText">Rename</Text>
                </Button>
              </XStack>
            </YStack>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog>

    </YStack>
  )
}
