import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { XStack, YStack, Text, useTheme } from 'tamagui'
import { Pressable } from 'react-native'
import { ArrowLeft } from 'lucide-react-native'

type AppHeaderProps = {
  title: string
  showBackButton?: boolean
  onBackPress?: () => void
}

export function AppHeader({ title, showBackButton = false, onBackPress }: AppHeaderProps) {
  const insets = useSafeAreaInsets()
  const theme = useTheme()

  return (
    <YStack
      backgroundColor={theme.background.get()}
      borderBottomWidth={0.5}
      borderBottomColor="$borderColor"
      paddingTop={insets.top}
    >
      <XStack
        height={56}
        alignItems="center"
        paddingHorizontal="$4"
        gap="$3"
      >
        {showBackButton && (
          <Pressable onPress={onBackPress}>
            <ArrowLeft size={24} color={theme.color.get()} />
          </Pressable>
        )}
        <Text fontSize={18} fontWeight="600" color="$color" flex={1}>
          {title}
        </Text>
      </XStack>
    </YStack>
  )
}
