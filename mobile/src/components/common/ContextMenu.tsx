import { Button, Sheet, Text, YStack } from 'tamagui'

export type ContextMenuItem = {
  key: string
  label: string
  onPress: () => void
  destructive?: boolean
}

type ContextMenuProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  items: ContextMenuItem[]
}

export function ContextMenu({ open, onOpenChange, title, items }: ContextMenuProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange} modal snapPoints={[40]}>
      <Sheet.Overlay />
      <Sheet.Frame padding="$5" gap="$3">
        {title ? (
          <Text fontSize={16} fontWeight="600">
            {title}
          </Text>
        ) : null}
        <YStack gap="$2">
          {items.map((item) => (
            <Button
              key={item.key}
              onPress={item.onPress}
              bg={item.destructive ? '$red10' : '$accent'}
              color={item.destructive ? '$red1' : '$accentText'}
            >
              {item.label}
            </Button>
          ))}
        </YStack>
      </Sheet.Frame>
    </Sheet>
  )
}
