import { useEffect } from 'react'
import { RefreshControl } from 'react-native'
import { XStack, YStack, Text } from 'tamagui'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { ChevronUp, RefreshCw } from 'lucide-react-native'

import { AppHeader, EmptyState, FileList, IconButton, Screen } from '@/components'
import { useSftpStore, useSnackbarStore } from '@/stores'
import type { ConnectionsStackParamList } from '@/navigation/AppNavigator'
import type { FileInfo } from '@/types'

export function SftpScreen() {
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

  return (
    <>
      <AppHeader
        title={connectionName ? `SFTP: ${connectionName}` : 'SFTP Browser'}
        showBackButton
        onBackPress={() => navigation.goBack()}
      />
      <Screen
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={handleRefresh} />
        }
      >
        <YStack gap="$3" flex={1}>
          <XStack ai="center" jc="space-between" gap="$3">
            <Text color="$placeholderColor" flex={1} numberOfLines={1}>
              {currentPath}
            </Text>
            <XStack gap="$2">
              <IconButton onPress={() => goUp()}>
                <ChevronUp size={14} />
              </IconButton>
              <IconButton onPress={handleRefresh}>
                <RefreshCw size={14} />
              </IconButton>
            </XStack>
          </XStack>

          {!connected ? (
            <EmptyState
              title="No SFTP connection"
              description={error ?? 'Connect to a host to browse files.'}
            />
          ) : (
            <FileList files={files} onOpenFolder={handleOpenFolder} />
          )}
        </YStack>
      </Screen>
    </>
  )
}
