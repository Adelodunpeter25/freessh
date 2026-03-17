import { Button, Sheet, Text, View, XStack, YStack } from 'tamagui'
import type { ReactNode } from 'react'

export type ContextMenuItem = {
  type?: 'item'
  key: string
  label: string
  onPress: () => void
  destructive?: boolean
  disabled?: boolean
  icon?: ReactNode
} | {
  type: 'separator'
  key: string
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
          {items.map((item) => {
            if (item.type === 'separator') {
              return (
                <View
                  key={item.key}
                  height={1}
                  backgroundColor="$borderColor"
                  opacity={0.6}
                />
              )
            }

            const isDestructive = item.destructive === true
            return (
              <Button
                key={item.key}
                onPress={() => {
                  onOpenChange(false)
                  item.onPress()
                }}
                disabled={item.disabled}
                bg={isDestructive ? '$red10' : '$accent'}
                color={isDestructive ? '$red1' : '$accentText'}
              >
                <XStack gap="$2" alignItems="center">
                  {item.icon ? (
                    <View width={18} height={18} alignItems="center" justifyContent="center">
                      {item.icon}
                    </View>
                  ) : null}
                  <Text
                    color={isDestructive ? '$red1' : '$accentText'}
                    fontWeight="600"
                  >
                    {item.label}
                  </Text>
                </XStack>
              </Button>
            )
          })}
        </YStack>
      </Sheet.Frame>
    </Sheet>
  )
}
