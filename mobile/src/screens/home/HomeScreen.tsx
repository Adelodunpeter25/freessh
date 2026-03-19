import { 
  Server, 
  Key, 
  ArrowRightLeft, 
  Code2, 
  Fingerprint, 
  History,
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
import { useConnectionStore, useSnippetStore, useKeyStore, useLogStore, useKnownHostStore } from '@/stores'

type HubItem = {
  id: string
  title: string
  icon: any
  screen: keyof ConnectionsStackParamList | 'Connections'
  count?: number
}

export function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ConnectionsStackParamList>>()
  const t = useTheme()
  const connections = useConnectionStore((state) => state.connections)
  const snippets = useSnippetStore((state) => state.snippets)
  const keys = useKeyStore((state) => state.keys)
  const logs = useLogStore((state) => state.logs)
  const knownHosts = useKnownHostStore((state) => state.knownHosts)

  const items: HubItem[] = [
    { id: 'hosts', title: 'Hosts', icon: Server, screen: 'Connections', count: connections.length },
    { id: 'keychain', title: 'Keychain', icon: Key, screen: 'Keys', count: keys.length },
    { id: 'forwarding', title: 'Port forwarding', icon: ArrowRightLeft, screen: 'Main' }, // Placeholder
    { id: 'snippets', title: 'Snippets', icon: Code2, screen: 'Snippets', count: snippets.length },
    { id: 'known_hosts', title: 'Known hosts', icon: Fingerprint, screen: 'KnownHosts', count: knownHosts.length },
    { id: 'logs', title: 'Logs', icon: History, screen: 'Logs', count: logs.length },
  ]

  return (
    <ScrollView backgroundColor="$background" flex={1}>
      <YStack p="$4" pt="$3">
        <Card
          borderRadius={16}
          overflow="hidden"
          backgroundColor="$backgroundHover"
          borderWidth={1}
          borderColor="$borderColor"
          elevation={0}
        >
          {items.map((item, index) => (
            <YStack key={item.id}>
              <Card
                p="$3"
                px="$4"
                borderRadius={0}
                backgroundColor="transparent"
                borderWidth={0}
                pressStyle={{ scale: 0.995, backgroundColor: '$backgroundHover' }}
                onPress={() => {
                  if (item.id === 'hosts') {
                    // @ts-ignore
                    navigation.navigate('Connections')
                  } else {
                    // @ts-ignore
                    navigation.navigate(item.screen)
                  }
                }}
              >
                <XStack ai="center" jc="space-between">
                  <XStack ai="center" gap="$3">
                    <Circle size={28} bg="$borderColor" opacity={0.5} ai="center" jc="center">
                      <item.icon size={15} color={t.color.get()} />
                    </Circle>
                    <Text fontSize={14} fontWeight="600" color="$color">
                      {item.title}
                    </Text>
                  </XStack>

                  <XStack ai="center" gap="$2.5">
                    {item.count !== undefined && (
                      <Text fontSize={13} fontWeight="500" color="$placeholderColor">
                        {item.count}
                      </Text>
                    )}
                    <ChevronRight size={14} color={t.placeholderColor.get()} />
                  </XStack>
                </XStack>
              </Card>
              {index < items.length - 1 ? (
                <Separator borderColor="$borderColor" opacity={0.6} />
              ) : null}
            </YStack>
          ))}
        </Card>
      </YStack>
    </ScrollView>
  )
}
