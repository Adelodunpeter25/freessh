import { useEffect } from 'react'
import { YStack, ScrollView } from 'tamagui'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'

import { AppHeader, Screen, EmptyState, KnownHostCard, LoadingState } from '@/components'
import { useKnownHostStore } from '@/stores'
import type { ConnectionsStackParamList } from '@/navigation/AppNavigator'

export function KnownHostsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ConnectionsStackParamList>>()
  const { knownHosts, loading, initialize, removeKnownHost } = useKnownHostStore()

  useEffect(() => {
    initialize()
  }, [])

  return (
    <YStack flex={1}>
      <AppHeader 
        title="Known Hosts" 
        showBackButton 
        onBackPress={() => navigation.goBack()} 
      />
      
      <Screen>
        {loading ? (
          <LoadingState />
        ) : knownHosts.length === 0 ? (
          <EmptyState 
            title="No known hosts" 
            description="Verified host fingerprints will be saved here." 
          />
        ) : (
          <ScrollView showsVerticalScrollIndicator={false}>
            <YStack gap="$3" pb="$4">
              {knownHosts.map((host) => (
                <KnownHostCard 
                  key={host.id} 
                  host={host} 
                  onDelete={() => removeKnownHost(host.id)}
                />
              ))}
            </YStack>
          </ScrollView>
        )}
      </Screen>
    </YStack>
  )
}
