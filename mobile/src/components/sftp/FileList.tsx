import { YStack } from 'tamagui'
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
  if (files.length === 0) {
    return (
      <EmptyState
        title="Empty folder"
        description="This location has no files or folders."
      />
    )
  }

  return (
    <YStack>
      {files.map((entry) =>
        entry.is_dir ? (
          <FolderCard
            key={entry.path}
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
        ) : (
          <FileCard
            key={entry.path}
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
        ),
      )}
    </YStack>
  )
}
