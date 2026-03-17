import { useEffect, useState, useCallback } from 'react'
import { RefreshControl } from 'react-native'
import { YStack } from 'tamagui'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'

import { AppHeader, Screen, EmptyState, KnownHostCard, LoadingState, SearchBar, SearchEmptyState, SectionHeader } from '@/components'
import { useSearch } from '@/hooks'
import { useKnownHostStore } from '@/stores'
import type { ConnectionsStackParamList } from '@/navigation/AppNavigator'

export function KnownHostsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ConnectionsStackParamList>>()
  const { knownHosts, loading, initialize, removeKnownHost } = useKnownHostStore()
  const [refreshing, setRefreshing] = useState(false)

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    try {
      await initialize()
    } finally {
      setRefreshing(false)
    }
  }, [initialize])

  const { query, filtered, setQuery, clearQuery, isEmpty } = useSearch({
    items: knownHosts,
    fields: ['hostname'],
  })

  const showEmpty = query.length > 0 && isEmpty

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
      
      <Screen
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {loading ? (
          <LoadingState />
        ) : (
          <YStack gap="$4">
            <SearchBar
              value={query}
              onChangeText={setQuery}
              onClear={clearQuery}
              placeholder="Search known hosts"
            />

            {knownHosts.length === 0 ? (
              <EmptyState 
                title="No known hosts" 
                description="Verified host fingerprints will be saved here." 
              />
            ) : showEmpty ? (
              <SearchEmptyState query={query} />
            ) : (
              <>
                <SectionHeader title="Known Hosts" />
                <YStack gap="$3">
                  {filtered.map((host) => (
                    <KnownHostCard 
                      key={host.id} 
                      host={host} 
                      onDelete={() => removeKnownHost(host.id)}
                    />
                  ))}
                </YStack>
              </>
            )}
          </YStack>
        )}
      </Screen>
    </YStack>
  )
}
