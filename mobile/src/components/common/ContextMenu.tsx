import type { ReactNode } from 'react'
import { Menu, MenuOption, MenuOptions, MenuTrigger } from 'react-native-popup-menu'
import { Text, View, XStack, YStack } from 'tamagui'

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
  children: ReactNode
}

export function ContextMenu({ title, items, triggerOnLongPress = true, children }: ContextMenuProps) {
  return (
    <Menu
      onOpen={() => {
        console.log('[ContextMenu] open', title ?? 'untitled')
      }}
      onClose={() => {
        console.log('[ContextMenu] close', title ?? 'untitled')
      }}
    >
      <MenuTrigger triggerOnLongPress={triggerOnLongPress}>
        {children}
      </MenuTrigger>
      <MenuOptions
        customStyles={{
          optionsContainer: {
            borderRadius: 12,
            paddingVertical: 8,
            backgroundColor: '#111827',
            borderColor: 'rgba(255,255,255,0.08)',
            borderWidth: 1,
            shadowColor: '#000',
            shadowOpacity: 0.2,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 8 },
          },
        }}
      >
        <YStack gap="$2" paddingHorizontal="$3" paddingVertical="$2">
          {title ? (
            <Text fontSize={12} fontWeight="700" opacity={0.7} color="$color">
              {title}
            </Text>
          ) : null}
          {items.map((item) => {
            if (item.type === 'separator') {
              return (
                <View
                  key={item.key}
                  height={1}
                  backgroundColor="$borderColor"
                  opacity={0.4}
                />
              )
            }

            const isDestructive = item.destructive === true
            return (
              <MenuOption
                key={item.key}
                onSelect={() => {
                  console.log('[ContextMenu] select', title ?? 'untitled', item.key)
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
                  {item.icon ? (
                    <View width={18} height={18} alignItems="center" justifyContent="center">
                      {item.icon}
                    </View>
                  ) : null}
                  <Text
                    color={isDestructive ? '$red10' : '$color'}
                    fontWeight="600"
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
