import { Folder, Server } from 'lucide-react-native'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { Pressable } from 'react-native'
import { Circle, Separator, Text, XStack, YStack, useTheme } from 'tamagui'

import { AppHeader } from '@/components/common/AppHeader'
import { EmptyState } from '@/components/common/EmptyState'
import { Screen } from '@/components/common/Screen'
import type { ConnectionsStackParamList } from '@/navigation/AppNavigator'
import { useSftpStore } from '@/stores/sftp'
import { useTerminalStore } from '@/stores/terminalStore'

type ActiveSessionItem = {
  id: string
  name: string
  type: 'ssh' | 'sftp'
}

export function ActiveSessionsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ConnectionsStackParamList>>()
  const theme = useTheme()

  const terminalSessions = useTerminalStore((state) => state.sessions)
  const setActiveTerminalSession = useTerminalStore((state) => state.setActiveSession)
  const sftpSessions = useSftpStore((state) => state.sessions)
  const setActiveSftpSession = useSftpStore((state) => state.setActiveSession)

  const items: ActiveSessionItem[] = [
    ...terminalSessions.map((session) => ({
      id: session.id,
      name: session.name,
      type: 'ssh' as const,
    })),
    ...sftpSessions.map((session) => ({
      id: session.id,
      name: session.connectionName,
      type: 'sftp' as const,
    })),
  ]

  return (
    <YStack flex={1} bg="$background">
      <AppHeader
        title="Active Sessions"
        showBackButton
        onBackPress={() => navigation.goBack()}
      />
      <Screen>
        {items.length === 0 ? (
          <EmptyState
            title="No active sessions"
            description="Connect to a host to start an SSH or SFTP session."
          />
        ) : (
          <YStack
            borderRadius={16}
            overflow="hidden"
            backgroundColor="$backgroundStrong"
            borderWidth={1}
            borderColor="$borderColor"
          >
            {items.map((item, index) => {
              const isLast = index === items.length - 1
              const Icon = item.type === 'ssh' ? Server : Folder

              return (
                <YStack key={`${item.type}-${item.id}`}>
                  <Pressable
                    onPress={() => {
                      if (item.type === 'ssh') {
                        setActiveTerminalSession(item.id)
                        navigation.navigate('Sessions')
                        return
                      }

                      setActiveSftpSession(item.id)
                      navigation.navigate('Sftp')
                    }}
                  >
                    <YStack
                      p="$3"
                      px="$4"
                      backgroundColor="$backgroundStrong"
                    >
                      <XStack ai="center" jc="space-between">
                        <XStack ai="center" gap="$3">
                          <Circle size={30} bg="$borderColor" opacity={0.5} ai="center" jc="center">
                            <Icon size={16} color={theme.color.get()} />
                          </Circle>
                          <YStack gap="$1">
                            <Text fontSize={16} fontWeight="600" color="$color">
                              {item.name}
                            </Text>
                            <Text fontSize={12} color="$placeholderColor">
                              {item.type === 'ssh' ? 'SSH session' : 'SFTP session'}
                            </Text>
                          </YStack>
                        </XStack>
                      </XStack>
                    </YStack>
                  </Pressable>
                  {!isLast ? <Separator borderColor="$borderColor" opacity={0.6} /> : null}
                </YStack>
              )
            })}
          </YStack>
        )}
      </Screen>
    </YStack>
  )
}
