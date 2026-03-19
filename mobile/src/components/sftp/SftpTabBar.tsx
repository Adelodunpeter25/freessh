import { Pressable } from 'react-native'
import { ArrowLeft, Monitor, X } from 'lucide-react-native'
import { Text, XStack, YStack, useTheme } from 'tamagui'

type SftpTabBarProps = {
  title: string
  onBackPress: () => void
  onCancelPress: () => void
}

export function SftpTabBar({ title, onBackPress, onCancelPress }: SftpTabBarProps) {
  const theme = useTheme();

  return (
    <YStack
      px="$2.5"
      pt="$1.5"
      pb="$1.5"
      backgroundColor="$background"
      borderBottomWidth={1}
      borderColor="$borderColor"
    >
      <XStack alignItems="center" gap="$1.5">
        <Pressable onPress={onBackPress} hitSlop={8}>
          <XStack
            width={34}
            height={34}
            borderRadius={9}
            alignItems="center"
            justifyContent="center"
            backgroundColor="$backgroundHover"
            borderWidth={1}
            borderColor="$borderColor"
          >
            <ArrowLeft size={16} color={theme.color.get()} />
          </XStack>
        </Pressable>
        <XStack
          minWidth={180}
          maxWidth={280}
          px="$2.5"
          height={34}
          borderRadius={9}
          alignItems="center"
          gap="$2"
          backgroundColor="$backgroundPress"
          borderWidth={1}
          borderColor="$borderColor"
        >
          <Monitor size={14} color={theme.color.get()} />
          <Text
            numberOfLines={1}
            color="$color"
            fontSize={12}
            fontWeight="500"
            flex={1}
          >
            {title}
          </Text>
        </XStack>

        <Pressable onPress={onCancelPress} hitSlop={8}>
          <XStack
            width={34}
            height={34}
            borderRadius={9}
            alignItems="center"
            justifyContent="center"
            backgroundColor="$backgroundHover"
            borderWidth={1}
            borderColor="$borderColor"
          >
            <X size={16} color={theme.color.get()} />
          </XStack>
        </Pressable>
      </XStack>
    </YStack>
  );
}
