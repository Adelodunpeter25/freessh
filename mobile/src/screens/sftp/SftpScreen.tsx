import { useEffect } from 'react'
import { RefreshControl } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Text, View, XStack, YStack } from 'tamagui'

import { EmptyState, FileList, IconButton, Screen, SftpBreadcrumb } from '@/components'
import { useSftpStore, useSnackbarStore } from '@/stores'
import type { FileInfo } from '@/types'

export function SftpScreen() {
  const insets = useSafeAreaInsets()
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

  const handleRefresh = async () => {
    try {
      await listDirectory(currentPath)
    } catch {
      showSnackbar('Failed to refresh folder', 'error')
    }
  }

  const handleOpenFolder = async (folder: FileInfo) => {
    try {
      await openFolder(folder.path)
    } catch {
      showSnackbar(`Failed to open "${folder.name}"`, 'error')
    }
  }

  const breadcrumbParts = currentPath.split('/').filter(Boolean)
  const rootLabel = connectionName ?? 'Home'
  const lastLabel = breadcrumbParts[breadcrumbParts.length - 1] ?? rootLabel
  const canGoUp = currentPath !== '/'

  return (
    <Screen
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={handleRefresh} />
      }
    >
      <YStack gap="$0" flex={1} pt={insets.top}>
        <SftpBreadcrumb
          rootLabel={rootLabel}
          lastLabel={lastLabel}
          onUpload={() => showSnackbar('Upload coming soon', 'info')}
          onSearch={() => showSnackbar('Search coming soon', 'info')}
          onMore={() => showSnackbar('More actions coming soon', 'info')}
        />

        <View
          mx="$3"
          mt="$3"
          borderRadius={16}
          overflow="hidden"
          borderWidth={1}
          borderColor="$borderColor"
          bg="$backgroundStrong"
          flex={1}
        >
          {canGoUp ? (
            <XStack
              px="$3"
              py="$3"
              borderBottomWidth={1}
              borderBottomColor="$borderColor"
            >
              <Text color="$color" fontSize={15} onPress={() => goUp()}>
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
            <FileList
              files={files}
              onOpenFolder={handleOpenFolder}
              onOpenFile={(file) => showSnackbar(`Selected "${file.name}"`, 'info')}
            />
          )}
        </View>
      </YStack>
    </Screen>
  )
}
