import { Button as TButton, Dialog, Text, XStack, YStack } from 'tamagui'
import { Button } from './Button'

type ConfirmDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  confirmText?: string
  cancelText?: string
  destructive?: boolean
  onConfirm: () => void
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = 'Delete',
  cancelText = 'Cancel',
  destructive = false,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay
          key="overlay"
          opacity={0.5}
          backgroundColor="$shadowColor"
        />
        <Dialog.Content
          key="content"
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
                {title}
              </Text>
            </Dialog.Title>
            {description ? (
              <Dialog.Description>
                <Text fontSize={14} color="$placeholderColor">
                  {description}
                </Text>
              </Dialog.Description>
            ) : null}

            <XStack gap="$2" justifyContent="flex-end">
              <Dialog.Close asChild>
                <TButton
                  bg="$background"
                  color="$color"
                  borderWidth={1}
                  borderColor="$borderColor"
                >
                  {cancelText}
                </TButton>
              </Dialog.Close>
              <Button
                bg={destructive ? '$red10' : '$accent'}
                color={destructive ? '$red1' : '$accentText'}
                pressStyle={{ bg: destructive ? '$red9' : '$accentPress' }}
                onPress={() => {
                  onConfirm()
                  onOpenChange(false)
                }}
              >
                {confirmText}
              </Button>
            </XStack>
          </YStack>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  )
}
