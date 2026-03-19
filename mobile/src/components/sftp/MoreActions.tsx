import { Eye, EyeOff, MoreVertical } from 'lucide-react-native'
import { Menu, MenuOption, MenuOptions, MenuTrigger } from 'react-native-popup-menu'
import { Text, XStack, useTheme } from 'tamagui'

type MoreActionsProps = {
  showHidden: boolean
  onToggleShowHidden: () => void
}

export function MoreActions({ showHidden, onToggleShowHidden }: MoreActionsProps) {
  const theme = useTheme()

  return (
    <Menu>
      <MenuTrigger>
        <XStack
          width={32}
          height={32}
          borderRadius={999}
          alignItems="center"
          justifyContent="center"
        >
          <MoreVertical size={14} color={theme.color.get()} />
        </XStack>
      </MenuTrigger>
      <MenuOptions
        customStyles={{
          optionsContainer: {
            borderRadius: 10,
            paddingVertical: 4,
            backgroundColor: theme.background.get(),
            borderColor: theme.borderColor.get(),
            borderWidth: 1,
            minWidth: 170,
            marginRight: 6,
          },
        }}
      >
        <MenuOption
          onSelect={onToggleShowHidden}
          customStyles={{
            optionWrapper: {
              paddingVertical: 8,
              paddingHorizontal: 10,
            },
          }}
        >
          <XStack alignItems="center" gap="$2">
            {showHidden ? (
              <EyeOff size={14} color={theme.color.get()} />
            ) : (
              <Eye size={14} color={theme.color.get()} />
            )}
            <Text color="$color" fontSize={13} fontWeight="600">
              {showHidden ? 'Hide hidden files' : 'Show hidden files'}
            </Text>
          </XStack>
        </MenuOption>
      </MenuOptions>
    </Menu>
  )
}
