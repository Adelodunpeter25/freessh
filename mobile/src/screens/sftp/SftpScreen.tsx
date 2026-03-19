import { useCallback, useEffect, useMemo } from 'react'
import { RefreshControl, ScrollView } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Text, XStack, YStack } from 'tamagui'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'

import { EmptyState, FileList, SftpBreadcrumb, SftpTabBar } from '@/components'
import { useSftpStore, useSnackbarStore } from '@/stores'
import type { FileInfo } from '@/types'
import type { ConnectionsStackParamList } from '@/navigation/AppNavigator'
import { getSftpBreadcrumb } from '@/utils/sftp'

export function SftpScreen() {
  const insets = useSafeAreaInsets()
  const navigation = useNavigation<NativeStackNavigationProp<ConnectionsStackParamList>>()
  const files = useSftpStore((state) => state.files)
  const currentPath = useSftpStore((state) => state.currentPath)
  const loading = useSftpStore((state) => state.loading)
  const connected = useSftpStore((state) => state.connected)
  const connectionName = useSftpStore((state) => state.connectionName)
  const error = useSftpStore((state) => state.error)
  const listDirectory = useSftpStore((state) => state.listDirectory)
  const openFolder = useSftpStore((state) => state.openFolder)
  const goUp = useSftpStore((state) => state.goUp)
  const disconnect = useSftpStore((state) => state.disconnect)
  const showSnackbar = useSnackbarStore((state) => state.show)

  useEffect(() => {
    return () => {
      disconnect()
    }
  }, [disconnect])

  const handleRefresh = useCallback(async () => {
    try {
      await listDirectory(currentPath)
    } catch {
      showSnackbar('Failed to refresh folder', 'error')
    }
  }, [currentPath, listDirectory, showSnackbar])

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
  const tabTitle = useMemo(
    () => (connectionName ? `SFTP: ${connectionName}` : 'SFTP'),
    [connectionName],
  )
  const handleGoUp = useCallback(() => {
    void goUp()
  }, [goUp])
  const handleBack = useCallback(() => {
    navigation.goBack()
  }, [navigation])
  const pinnedTabBarHeight = insets.top + 52

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
          title={tabTitle}
          onBackPress={handleBack}
        />
      </YStack>

      <YStack flex={1} bg="$backgroundStrong" mt={pinnedTabBarHeight}>
        <SftpBreadcrumb
          rootLabel={rootLabel}
          lastLabel={lastLabel}
          onUpload={() => showSnackbar('Upload coming soon', 'info')}
          onSearch={() => showSnackbar('Search coming soon', 'info')}
          onMore={() => showSnackbar('More actions coming soon', 'info')}
        />

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

        {!connected ? (
          <YStack p="$4">
            <EmptyState
              title="No SFTP connection"
              description={error ?? 'Connect to a host to browse files.'}
            />
          </YStack>
        ) : (
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingBottom: 16 }}
            refreshControl={
              <RefreshControl refreshing={loading} onRefresh={handleRefresh} />
            }
          >
            <FileList
              files={files}
              onOpenFolder={handleOpenFolder}
              onOpenFile={(file) => showSnackbar(`Selected "${file.name}"`, 'info')}
            />
          </ScrollView>
        )}
      </YStack>
    </YStack>
  )
}
