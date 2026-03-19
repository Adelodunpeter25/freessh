import { Pressable, RefreshControl, ScrollView } from 'react-native'
import { Text, XStack, YStack } from 'tamagui'
import type { FileInfo } from '@/types'
import { EmptyState, SearchEmptyState } from '@/components/common'
import { FileList } from './FileList'

type SftpBrowserProps = {
  connected: boolean
  error: string | null
  query: string
  showSearchEmpty: boolean
  canGoUp: boolean
  hasSelection: boolean
  copyMode: boolean
  loading: boolean
  files: FileInfo[]
  isSelected: (path: string) => boolean
  onClearSelection: () => void
  onGoUp: () => void
  onRefresh: () => void
  onToggleSelect: (entry: FileInfo) => void
  onOpenFolder: (folder: FileInfo) => void
  onOpenFile: (file: FileInfo) => void
}

export function SftpBrowser({
  connected,
  error,
  query,
  showSearchEmpty,
  canGoUp,
  hasSelection,
  copyMode,
  loading,
  files,
  isSelected,
  onClearSelection,
  onGoUp,
  onRefresh,
  onToggleSelect,
  onOpenFolder,
  onOpenFile,
}: SftpBrowserProps) {
  if (!connected) {
    return (
      <YStack p="$4">
        <EmptyState
          title="No SFTP connection"
          description={error ?? 'Connect to a host to browse files.'}
        />
      </YStack>
    )
  }

  if (showSearchEmpty) {
    return (
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
    )
  }

  return (
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
        <Pressable onPress={onGoUp}>
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
                  onClearSelection()
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
        refreshControl={<RefreshControl refreshing={loading} onRefresh={onRefresh} />}
      >
        <FileList
          files={files}
          hasSelection={hasSelection && !copyMode}
          isSelected={isSelected}
          onToggleSelect={onToggleSelect}
          onOpenFolder={onOpenFolder}
          onOpenFile={onOpenFile}
        />
      </ScrollView>
    </YStack>
  )
}
