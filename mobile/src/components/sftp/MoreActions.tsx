import { Eye, EyeOff } from 'lucide-react-native'
import { Sheet, YStack, ListItem, useTheme } from 'tamagui'

type MoreActionsProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  showHidden: boolean
  onToggleShowHidden: () => void
}

export function MoreActions({
  open,
  onOpenChange,
  showHidden,
  onToggleShowHidden,
}: MoreActionsProps) {
  const theme = useTheme()

  return (
    <Sheet
      modal
      open={open}
      onOpenChange={onOpenChange}
      snapPoints={[22]}
      dismissOnSnapToBottom
    >
      <Sheet.Overlay />
      <Sheet.Frame p="$4" backgroundColor="$background">
        <Sheet.Handle />
        <YStack gap="$2" pt="$4">
          <ListItem
            borderWidth={1}
            borderColor="$borderColor"
            borderRadius={14}
            backgroundColor="$background"
            hoverStyle={{ backgroundColor: '$backgroundHover' }}
            pressStyle={{ backgroundColor: '$backgroundPress' }}
            title={showHidden ? 'Hide hidden files' : 'Show hidden files'}
            subTitle={showHidden ? 'Dot files are currently visible' : 'Display dot files and folders'}
            icon={
              showHidden ? (
                <EyeOff size={18} color={theme.color.get()} />
              ) : (
                <Eye size={18} color={theme.color.get()} />
              )
            }
            onPress={() => {
              onToggleShowHidden()
              onOpenChange(false)
            }}
          />
        </YStack>
      </Sheet.Frame>
    </Sheet>
  )
}

