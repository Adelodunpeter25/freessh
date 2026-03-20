import { YStack } from 'tamagui'
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
      <FileList
        files={files}
        loading={loading}
        canGoUp={canGoUp}
        copyMode={copyMode}
        hasSelection={hasSelection && !copyMode}
        isSelected={isSelected}
        onClearSelection={onClearSelection}
        onGoUp={onGoUp}
        onRefresh={onRefresh}
        onToggleSelect={onToggleSelect}
        onOpenFolder={onOpenFolder}
        onOpenFile={onOpenFile}
      />
    </YStack>
  )
}
