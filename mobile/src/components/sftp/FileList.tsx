import React, { useCallback } from 'react'
import { FlatList } from 'react-native'
import type { FileInfo } from '@/types'
import { EmptyState } from '@/components/common'
import { FileCard } from './FileCard'
import { FolderCard } from './FolderCard'

type FileListProps = {
  files: FileInfo[]
  onOpenFolder: (folder: FileInfo) => void
  onOpenFile?: (file: FileInfo) => void
  onToggleSelect: (entry: FileInfo) => void
  isSelected: (path: string) => boolean
  hasSelection: boolean
}

export function FileList({
  files,
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

  if (files.length === 0) {
    return (
      <EmptyState
        title="Empty folder"
        description="This location has no files or folders."
      />
    )
  }

  return (
    <FlatList
      data={files}
      renderItem={renderItem}
      keyExtractor={(item) => item.path}
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
