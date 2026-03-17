import { 
  Server, 
  Key, 
  ArrowRightLeft, 
  Code2, 
  Fingerprint, 
  History,
  ChevronRight,
  ShieldCheck
} from 'lucide-react-native'
import { 
  YStack, 
  XStack, 
  Text, 
  Card, 
  H3, 
  Theme, 
  useTheme, 
  Circle,
  ScrollView,
  View
} from 'tamagui'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { ConnectionsStackParamList } from '@/navigation/AppNavigator'
import { useConnectionStore, useSnippetStore } from '@/stores'

type HubItem = {
  id: string
  title: string
  icon: any
  screen: keyof ConnectionsStackParamList
  count?: number
}

export function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ConnectionsStackParamList>>()
  const t = useTheme()
  const connections = useConnectionStore((state) => state.connections)
  const snippets = useSnippetStore((state) => state.snippets)

  const items: HubItem[] = [
    { id: 'hosts', title: 'Hosts', icon: Server, screen: 'Main', count: connections.length },
    { id: 'sessions', title: 'Active Sessions', icon: History, screen: 'Sessions', count: 0 },
    { id: 'keychain', title: 'Keychain', icon: Key, screen: 'Keys', count: 0 },
    { id: 'forwarding', title: 'Port forwarding', icon: ArrowRightLeft, screen: 'Main' },
    { id: 'snippets', title: 'Snippets', icon: Code2, screen: 'Snippets', count: snippets.length },
    { id: 'known_hosts', title: 'Known hosts', icon: Fingerprint, screen: 'Main', count: 0 },
    { id: 'logs', title: 'Logs', icon: History, screen: 'Main', count: 0 },
  ]

  return (
    <ScrollView backgroundColor="$background" flex={1}>
      <YStack p="$4" pt="$2" gap="$4">
        {/* List Section */}
        <YStack gap="$2">
          {items.map((item) => (
            <Card
              key={item.id}
              p="$3"
              px="$4"
              borderRadius={16}
              backgroundColor="$backgroundStrong"
              borderWidth={1}
              borderColor="$borderColor"
              pressStyle={{ scale: 0.98, backgroundColor: '$backgroundHover' }}
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
                  <Circle size={40} bg="$borderColor" opacity={0.5} ai="center" jc="center">
                    <item.icon size={20} color={t.color.get()} />
                  </Circle>
                  <Text fontSize={15} fontWeight="600" color="$color">
                    {item.title}
                  </Text>
                </XStack>
                
                <XStack ai="center" gap="$3">
                  {item.count !== undefined && (
                    <Text fontSize={13} fontWeight="500" color="$placeholderColor">
                      {item.count}
                    </Text>
                  )}
                  <ChevronRight size={16} color={t.placeholderColor.get()} />
                </XStack>
              </XStack>
            </Card>
          ))}
        </YStack>
      </YStack>
    </ScrollView>
  )
}
