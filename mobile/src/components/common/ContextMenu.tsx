import type { ReactNode } from 'react'
import { Menu, MenuOption, MenuOptions, MenuTrigger, renderers } from 'react-native-popup-menu'
import { Text, View, XStack, YStack } from 'tamagui'
import { useThemeStore } from '@/stores'

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
  const theme = useThemeStore((state) => state.theme)
  const isDark = theme === 'dark'
  const colors = {
    background: isDark ? '#0b0b0b' : '#ffffff',
    border: isDark ? '#1f2937' : '#e2e8f0',
    text: isDark ? '#f1f5f9' : '#0f172a',
    subtitle: isDark ? '#9ca3af' : '#64748b',
    destructive: isDark ? '#f87171' : '#dc2626',
    separator: isDark ? '#1f2937' : '#e2e8f0',
  }

  return (
    <Menu
      renderer={renderers.Popover}
      rendererProps={{
        placement: 'auto',
        preferredPlacement: 'right',
        anchorStyle: {
          opacity: 0,
          transform: [{ scale: 0 }],
          elevation: 0,
          backgroundColor: 'transparent',
        },
      }}
    >
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
            backgroundColor: colors.background,
            borderColor: colors.border,
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
            <Text fontSize={12} fontWeight="700" opacity={0.8} color={colors.subtitle}>
              {title}
            </Text>
          ) : null}
          {items.map((item) => {
            if (item.type === 'separator') {
              return (
                <View
                  key={item.key}
                  height={1}
                  backgroundColor={colors.separator}
                  opacity={0.8}
                />
              )
            }

            const isDestructive = item.destructive === true
            return (
              <MenuOption
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
                  {item.icon ? (
                    <View width={18} height={18} alignItems="center" justifyContent="center">
                      {item.icon}
                    </View>
                  ) : null}
                  <Text
                    color={isDestructive ? colors.destructive : colors.text}
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
