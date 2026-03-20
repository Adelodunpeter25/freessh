import React, { useCallback } from 'react'
import { FlatList, Pressable, RefreshControl } from 'react-native'
import { Text, XStack } from 'tamagui'
import type { FileInfo } from '@/types'
import { EmptyState } from '@/components/common'
import { FileCard } from './FileCard'
import { FolderCard } from './FolderCard'

type FileListProps = {
  files: FileInfo[]
  loading: boolean
  canGoUp: boolean
  copyMode: boolean
  onGoUp: () => void
  onRefresh: () => void
  onClearSelection: () => void
  onOpenFolder: (folder: FileInfo) => void
  onOpenFile?: (file: FileInfo) => void
  onToggleSelect: (entry: FileInfo) => void
  isSelected: (path: string) => boolean
  hasSelection: boolean
}

export function FileList({
  files,
  loading,
  canGoUp,
  copyMode,
  onGoUp,
  onRefresh,
  onClearSelection,
  onOpenFolder,
  onOpenFile,
  onToggleSelect,
  isSelected,
  hasSelection,
}: FileListProps) {
  const renderItem = useCallback(({ item: entry }: { item: FileInfo }) => {
    if (entry.is_dir) {
      return (
        <FolderCard
          folder={entry}
          selected={isSelected(entry.path)}
          onLongPress={() => onToggleSelect(entry)}
          onPress={() => {
            if (hasSelection) {
              onToggleSelect(entry)
              return
            }
            onOpenFolder(entry)
          }}
        />
      )
    }

    return (
      <FileCard
        file={entry}
        selected={isSelected(entry.path)}
        onLongPress={() => onToggleSelect(entry)}
        onPress={() => {
          if (hasSelection) {
            onToggleSelect(entry)
            return
          }
          onOpenFile?.(entry)
        }}
      />
    )
  }, [isSelected, onToggleSelect, hasSelection, onOpenFolder, onOpenFile])

  return (
    <FlatList
      data={files}
      renderItem={renderItem}
      keyExtractor={(item) => item.path}
      ListHeaderComponent={
        canGoUp ? (
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
              {hasSelection && !copyMode ? (
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
        ) : null
      }
      ListEmptyComponent={
        <EmptyState
          title="Empty folder"
          description="This location has no files or folders."
        />
      }
      contentContainerStyle={{ paddingBottom: 16, flexGrow: files.length === 0 ? 1 : 0 }}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={onRefresh} />}
      initialNumToRender={15}
      maxToRenderPerBatch={10}
      windowSize={5}
      removeClippedSubviews={true}
      getItemLayout={(_, index) => ({
        length: 56,
        offset: 56 * index,
        index,
      })}
    />
  )
}
