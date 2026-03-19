import { Dialog, Text, XStack, YStack } from 'tamagui'
import { Button, ConfirmDialog, Input } from '@/components/common'
import type { FileInfo } from '@/types'

type SftpActionDialogsProps = {
  showDeleteDialog: boolean
  onShowDeleteDialogChange: (open: boolean) => void
  selectedCount: number
  onConfirmDelete: () => void
  showNewFolderDialog: boolean
  onShowNewFolderDialogChange: (open: boolean) => void
  newFolderName: string
  onNewFolderNameChange: (value: string) => void
  onCreateFolder: () => void
  showRenameDialog: boolean
  onShowRenameDialogChange: (open: boolean) => void
  renameValue: string
  onRenameValueChange: (value: string) => void
  onConfirmRename: () => void
  singleSelectedEntry: FileInfo | null
}

export function SftpActionDialogs({
  showDeleteDialog,
  onShowDeleteDialogChange,
  selectedCount,
  onConfirmDelete,
  showNewFolderDialog,
  onShowNewFolderDialogChange,
  newFolderName,
  onNewFolderNameChange,
  onCreateFolder,
  showRenameDialog,
  onShowRenameDialogChange,
  renameValue,
  onRenameValueChange,
  onConfirmRename,
  singleSelectedEntry,
}: SftpActionDialogsProps) {
  return (
    <>
      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={onShowDeleteDialogChange}
        title="Delete selected items?"
        description={`This will permanently delete ${selectedCount} item(s).`}
        destructive
        confirmText="Delete"
        onConfirm={onConfirmDelete}
      />

      <Dialog open={showNewFolderDialog} onOpenChange={onShowNewFolderDialogChange}>
        <Dialog.Portal>
          <Dialog.Overlay opacity={0.5} backgroundColor="$shadowColor" />
          <Dialog.Content
            bordered
            elevate
            borderRadius="$4"
            padding="$4"
            backgroundColor="$background"
            width="85%"
            maxWidth={420}
          >
            <YStack gap="$3">
              <Dialog.Title>
                <Text fontSize={18} fontWeight="700" color="$color">
                  New folder
                </Text>
              </Dialog.Title>
              <Input
                placeholder="Folder name"
                value={newFolderName}
                onChangeText={onNewFolderNameChange}
              />
              <XStack gap="$2" justifyContent="flex-end">
                <Button onPress={() => onShowNewFolderDialogChange(false)} bg="$background">
                  <Text color="$color">Cancel</Text>
                </Button>
                <Button onPress={onCreateFolder}>
                  <Text color="$accentText">Create</Text>
                </Button>
              </XStack>
            </YStack>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog>

      <Dialog open={showRenameDialog} onOpenChange={onShowRenameDialogChange}>
        <Dialog.Portal>
          <Dialog.Overlay opacity={0.5} backgroundColor="$shadowColor" />
          <Dialog.Content
            bordered
            elevate
            borderRadius="$4"
            padding="$4"
            backgroundColor="$background"
            width="85%"
            maxWidth={420}
          >
            <YStack gap="$3">
              <Dialog.Title>
                <Text fontSize={18} fontWeight="700" color="$color">
                  Rename
                </Text>
              </Dialog.Title>
              <Input
                placeholder="New name"
                value={renameValue}
                onChangeText={onRenameValueChange}
              />
              <XStack gap="$2" justifyContent="flex-end">
                <Button onPress={() => onShowRenameDialogChange(false)} bg="$background">
                  <Text color="$color">Cancel</Text>
                </Button>
                <Button onPress={onConfirmRename} disabled={!singleSelectedEntry}>
                  <Text color="$accentText">Rename</Text>
                </Button>
              </XStack>
            </YStack>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog>
    </>
  )
}
