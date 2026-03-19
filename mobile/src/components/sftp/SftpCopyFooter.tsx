import { Text, XStack } from 'tamagui'
import { Button } from '@/components/common'

type SftpCopyFooterProps = {
  itemCount: number
  onCopyHere: () => void
  onCancel: () => void
}

export function SftpCopyFooter({ itemCount, onCopyHere, onCancel }: SftpCopyFooterProps) {
  return (
    <XStack
      alignItems="center"
      justifyContent="space-between"
      gap="$2"
      px="$3"
      py="$2"
      borderTopWidth={1}
      borderTopColor="$borderColor"
      bg="$background"
    >
      <Text color="$placeholderColor" fontSize={12} numberOfLines={1} flex={1}>
        Choose destination for {itemCount} item(s)
      </Text>
      <XStack alignItems="center" gap="$2">
        <Button size="$3" bg="$background" onPress={onCancel}>
          <Text color="$color">Cancel</Text>
        </Button>
        <Button size="$3" onPress={onCopyHere}>
          <Text color="$accentText">Copy here</Text>
        </Button>
      </XStack>
    </XStack>
  )
}
