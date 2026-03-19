import React, { memo, useMemo } from 'react'
import { 
  Server, 
  Key, 
  ArrowRightLeft, 
  Code2, 
  Fingerprint, 
  History,
  Monitor,
  ChevronRight,
} from 'lucide-react-native'
import { 
  YStack, 
  XStack, 
  Text, 
  Card, 
  useTheme, 
  Circle,
  ScrollView,
  Separator
} from 'tamagui'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { ConnectionsStackParamList } from '@/navigation/AppNavigator'
import { useConnectionStore, useSnippetStore, useKeyStore, useLogStore, useKnownHostStore, useTerminalStore } from '@/stores'

type HubItem = {
  id: string
  title: string
  icon: any
  screen: keyof ConnectionsStackParamList | 'Connections'
  count?: number
}

const HubItemRow = memo(({ 
  item, 
  index, 
  isLast, 
  onPress, 
  theme 
}: { 
  item: HubItem; 
  index: number; 
  isLast: boolean; 
  onPress: () => void;
  theme: any;
}) => (
  <YStack key={item.id}>
    <Card
      p="$3"
      px="$4"
      borderRadius={0}
      backgroundColor="$backgroundStrong"
      borderWidth={0}
      pressStyle={{ scale: 0.995, backgroundColor: '$backgroundPress' }}
      onPress={onPress}
    >
      <XStack ai="center" jc="space-between">
        <XStack ai="center" gap="$3">
          <Circle size={30} bg="$borderColor" opacity={0.5} ai="center" jc="center">
            <item.icon size={17} color={theme.color.get()} />
          </Circle>
          <Text fontSize={16} fontWeight="600" color="$color">
            {item.title}
          </Text>
        </XStack>

        <XStack ai="center" gap="$2.5">
          {item.count !== undefined && (
            <Text fontSize={14} fontWeight="500" color="$placeholderColor">
              {item.count}
            </Text>
          )}
          <ChevronRight size={14} color={theme.placeholderColor.get()} />
        </XStack>
      </XStack>
    </Card>
    {!isLast ? (
      <Separator borderColor="$borderColor" opacity={0.6} />
    ) : null}
  </YStack>
))

export function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ConnectionsStackParamList>>()
  const t = useTheme()
  
  // Selective store subscriptions to minimize re-renders
  const connectionsCount = useConnectionStore((state) => state.connections.length)
  const snippetsCount = useSnippetStore((state) => state.snippets.length)
  const keysCount = useKeyStore((state) => state.keys.length)
  const logsCount = useLogStore((state) => state.logs.length)
  const knownHostsCount = useKnownHostStore((state) => state.knownHosts.length)
  
  const sessions = useTerminalStore((state) => state.sessions)
  const activeSessionId = useTerminalStore((state) => state.activeSessionId)
  
  const activeSession = useMemo(() =>
    sessions.find((session) => session.id === activeSessionId) ??
    (sessions.length > 0 ? sessions[sessions.length - 1] : undefined),
    [sessions, activeSessionId]
  )

  const items = useMemo((): HubItem[] => [
    { id: 'hosts', title: 'Hosts', icon: Server, screen: 'Connections', count: connectionsCount },
    {
      id: 'active_session',
      title: activeSession ? `Active session: ${activeSession.name}` : 'Active session',
      icon: Monitor,
      screen: 'Sessions',
      count: sessions.length,
    },
    { id: 'keychain', title: 'Keychain', icon: Key, screen: 'Keys', count: keysCount },
    { id: 'forwarding', title: 'Port forwarding', icon: ArrowRightLeft, screen: 'Main' }, // Placeholder
    { id: 'snippets', title: 'Snippets', icon: Code2, screen: 'Snippets', count: snippetsCount },
    { id: 'known_hosts', title: 'Known hosts', icon: Fingerprint, screen: 'KnownHosts', count: knownHostsCount },
    { id: 'logs', title: 'Logs', icon: History, screen: 'Logs', count: logsCount },
  ], [connectionsCount, snippetsCount, keysCount, logsCount, knownHostsCount, sessions.length, activeSession])

  return (
    <ScrollView backgroundColor="$background" flex={1}>
      <YStack p="$4" pt="$3">
        <Card
          borderRadius={16}
          overflow="hidden"
          backgroundColor="$backgroundStrong"
          borderWidth={1}
          borderColor="$borderColor"
          elevation={0}
        >
          {items.map((item, index) => (
            <HubItemRow 
              key={item.id}
              item={item}
              index={index}
              isLast={index === items.length - 1}
              theme={t}
              onPress={() => {
                if (item.id === 'hosts') {
                  // @ts-ignore
                  navigation.navigate('Connections')
                } else {
                  // @ts-ignore
                  navigation.navigate(item.screen)
                }
              }}
            />
          ))}
        </Card>
      </YStack>
    </ScrollView>
  )
}
