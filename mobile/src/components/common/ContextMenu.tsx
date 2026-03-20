import type { ReactNode } from 'react'
import { Menu, MenuOption, MenuOptions, MenuTrigger } from 'react-native-popup-menu'
import { Text, View, XStack, YStack, useTheme } from 'tamagui'

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
  title?: string
  items: ContextMenuItem[]
  triggerOnLongPress?: boolean
  onPress?: () => void
  children: ReactNode
}

export function ContextMenu({ title, items, triggerOnLongPress = true, onPress, children }: ContextMenuProps) {
  const theme = useTheme()

  return (    <Menu>
      <MenuTrigger
        triggerOnLongPress={triggerOnLongPress}
        onAlternativeAction={() => {
          onPress?.()
        }}
      >
        {children}
      </MenuTrigger>
      <MenuOptions
        customStyles={{
          optionsContainer: {
            borderRadius: 12,
            paddingVertical: 8,
            backgroundColor: theme.backgroundStrong.get(),
            borderColor: theme.borderColor.get(),
            borderWidth: 1,
            alignSelf: 'flex-end',
            marginRight: 8,
            shadowColor: '#000',
            shadowOpacity: 0.2,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 8 },
          },
        }}
      >
        <YStack gap="$2" paddingHorizontal="$3" paddingVertical="$2">
          {title ? (
            <Text fontSize={12} fontWeight="700" opacity={0.8} color="$colorMuted">
              {title}
            </Text>
          ) : null}
          {items.map((item) => {
            if (item.type === 'separator') {
              return (
                <View
                  key={item.key}
                  height={1}
                  backgroundColor="$contextMenuSeparator"
                  opacity={1}
                />
              )
            }

            const isDestructive = item.destructive === true
            return (              <MenuOption
                key={item.key}
                onSelect={() => {
                  item.onPress()
                }}
                disabled={item.disabled}
                customStyles={{
                  optionWrapper: {
                    paddingVertical: 10,
                    paddingHorizontal: 12,
                    borderRadius: 8,
                  },
                }}
              >
                <XStack gap="$2" alignItems="center">
                  {item.icon}
                  <Text
                    fontSize={14}
                    fontWeight="600"
                    color={isDestructive ? '$destructive' : '$color'}
                  >
                    {item.label}
                  </Text>
                </XStack>
              </MenuOption>
            )
          })}
        </YStack>
      </MenuOptions>
    </Menu>
  )
}
