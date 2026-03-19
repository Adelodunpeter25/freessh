import { Eye, EyeOff, MoreVertical } from 'lucide-react-native'
import { XStack, useTheme } from 'tamagui'
import { ContextMenu } from '@/components/common'

type MoreActionsProps = {
  showHidden: boolean
  onToggleShowHidden: () => void
}

export function MoreActions({ showHidden, onToggleShowHidden }: MoreActionsProps) {
  const theme = useTheme()

  return (
    <ContextMenu
      triggerOnLongPress={false}
      items={[
        {
          key: 'toggle-hidden',
          label: showHidden ? 'Hide hidden files' : 'Show hidden files',
          onPress: onToggleShowHidden,
          icon: showHidden ? (
            <EyeOff size={14} color={theme.color.get()} />
          ) : (
            <Eye size={14} color={theme.color.get()} />
          ),
        },
      ]}
    >
      <XStack
        width={32}
        height={32}
        borderRadius={999}
        alignItems="center"
        justifyContent="center"
      >
        <MoreVertical size={14} color={theme.color.get()} />
      </XStack>
    </ContextMenu>
  )
}

