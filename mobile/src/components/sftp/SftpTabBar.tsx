import { Pressable } from 'react-native'
import { ArrowLeft, Folder, X } from 'lucide-react-native'
import { ScrollView, Text, XStack, YStack, useTheme } from 'tamagui'
import type { SftpSession } from '@/stores'

type SftpTabBarProps = {
  sessions: SftpSession[]
  activeSessionId: string | null
  onBackPress: () => void
  onSelect: (id: string) => void
  onClose: (id: string) => void
}

export function SftpTabBar({
  sessions,
  activeSessionId,
  onBackPress,
  onSelect,
  onClose,
}: SftpTabBarProps) {
  const theme = useTheme()

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

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <XStack gap="$1.5" alignItems="center" pr="$1.5">
            {sessions.map((session) => {
              const isActive = session.id === activeSessionId
              return (
                <Pressable
                  key={session.id}
                  onPress={() => onSelect(session.id)}
                >
                  <XStack
                    minWidth={150}
                    maxWidth={220}
                    paddingLeft="$2.5"
                    paddingRight="$2"
                    height={34}
                    borderRadius={9}
                    alignItems="center"
                    gap="$2"
                    backgroundColor={isActive ? '$backgroundPress' : '$backgroundHover'}
                    borderWidth={1}
                    borderColor="$borderColor"
                  >
                    <Folder
                      size={14}
                      color={isActive ? theme.color.get() : theme.placeholderColor.get()}
                    />
                    <Text
                      flex={1}
                      numberOfLines={1}
                      color={isActive ? '$color' : '$placeholderColor'}
                      fontSize={12}
                      fontWeight="500"
                    >
                      {session.connectionName}
                    </Text>
                    <Pressable
                      hitSlop={8}
                      onPress={(event) => {
                        event.stopPropagation()
                        onClose(session.id)
                      }}
                    >
                      <X size={14} color={isActive ? theme.color.get() : theme.placeholderColor.get()} />
                    </Pressable>
                  </XStack>
                </Pressable>
              )
            })}
          </XStack>
        </ScrollView>
      </XStack>
    </YStack>
  )
}
