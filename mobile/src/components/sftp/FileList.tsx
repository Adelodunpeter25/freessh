import { YStack } from 'tamagui'
import type { FileInfo } from '@/types'
import { EmptyState } from '@/components/common'
import { FileCard } from './FileCard'
import { FolderCard } from './FolderCard'

type FileListProps = {
  files: FileInfo[]
  onOpenFolder: (folder: FileInfo) => void
  onOpenFile?: (file: FileInfo) => void
}

export function FileList({ files, onOpenFolder, onOpenFile }: FileListProps) {
  if (files.length === 0) {
    return (
      <EmptyState
        title="Empty folder"
        description="This location has no files or folders."
      />
    )
  }

  return (
    <YStack gap="$3">
      {files.map((entry) =>
        entry.is_dir ? (
          <FolderCard
            key={entry.path}
            folder={entry}
            onPress={() => onOpenFolder(entry)}
          />
        ) : (
          <FileCard
            key={entry.path}
            file={entry}
            onPress={onOpenFile ? () => onOpenFile(entry) : undefined}
          />
        ),
      )}
    </YStack>
  )
}
