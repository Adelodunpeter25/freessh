import { useCallback, useEffect, useMemo, useState } from 'react'
import { RefreshControl, ScrollView } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Text, XStack, YStack } from 'tamagui'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'

import { EmptyState, FileList, MoreActions, SearchEmptyState, SftpTabBar, SftpToolbar } from '@/components'
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
  const goUp = useSftpStore((state) => state.goUp)
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
  const [showMoreActions, setShowMoreActions] = useState(false)
  const { showHidden, toggleShowHidden, visibleFiles } = useSftpActions(files)
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

  const { rootLabel, lastLabel, canGoUp } = useMemo(
    () => getSftpBreadcrumb(currentPath, connectionName),
    [currentPath, connectionName],
  )
  const handleGoUp = useCallback(() => {
    void goUp()
  }, [goUp])
  const handleBack = useCallback(() => {
    navigation.goBack()
  }, [navigation])
  const handleCloseSession = useCallback((id: string) => {
    closeSession(id)
  }, [closeSession])
  const handlePressRoot = useCallback(() => {
    void listDirectory('/')
  }, [listDirectory])
  const handlePressCurrent = useCallback(() => {
    if (!connected) return
    void listDirectory(currentPath)
  }, [connected, currentPath, listDirectory])
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

      <YStack flex={1} bg="$backgroundStrong" mt={pinnedTabBarHeight}>
        <SftpToolbar
          rootLabel={rootLabel}
          lastLabel={lastLabel}
          query={query}
          onQueryChange={setQuery}
          onClearQuery={clearQuery}
          onUpload={() => showSnackbar('Upload coming soon', 'info')}
          onMore={() => setShowMoreActions(true)}
          onPressRoot={handlePressRoot}
          onPressCurrent={handlePressCurrent}
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
            mx="$3"
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
            mx="$3"
            mt="$2"
            mb="$3"
            borderWidth={1}
            borderColor="$borderColor"
            borderRadius={16}
            overflow="hidden"
            bg="$background"
          >
            {canGoUp ? (
              <XStack
                px="$3"
                minHeight={56}
                py="$2"
                borderBottomWidth={1}
                borderBottomColor="$borderColor"
                alignItems="center"
              >
                <Text color="$color" fontSize={14} fontWeight="600" onPress={handleGoUp}>
                  ..
                </Text>
              </XStack>
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
                onOpenFolder={handleOpenFolder}
                onOpenFile={(file) => showSnackbar(`Selected "${file.name}"`, 'info')}
              />
            </ScrollView>
          </YStack>
        )}
      </YStack>

      <MoreActions
        open={showMoreActions}
        onOpenChange={setShowMoreActions}
        showHidden={showHidden}
        onToggleShowHidden={toggleShowHidden}
      />
    </YStack>
  )
}
