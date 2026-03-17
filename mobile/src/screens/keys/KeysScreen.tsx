import { YStack, ScrollView, RefreshControl } from 'tamagui'
import { useNavigation } from '@react-navigation/native'
import { useState, useCallback } from 'react'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'

import { AddButton, EmptyState, Screen, AppHeader, KeyCard, SearchBar, SearchEmptyState, SectionHeader } from '@/components'
import { useSearch } from '@/hooks'
import { useKeyStore } from '@/stores'
import type { ConnectionsStackParamList } from '@/navigation/AppNavigator'

export function KeysScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ConnectionsStackParamList>>()
  const keys = useKeyStore((state) => state.keys)
  const loadKeys = useKeyStore((state) => state.loadKeys)
  const [refreshing, setRefreshing] = useState(false)

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    try {
      await loadKeys()
    } finally {
      setRefreshing(false)
    }
  }, [loadKeys])

  const { query, filtered, setQuery, clearQuery, isEmpty } = useSearch({
    items: keys,
    fields: ['name', 'algorithm'],
  })

  const showEmpty = query.length > 0 && isEmpty
  const isActuallyEmpty = keys.length === 0

  return (
    <>
      <AppHeader 
        title="SSH Keys" 
        showBackButton 
        onBackPress={() => navigation.goBack()} 
      />
      <Screen>
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <YStack gap="$4" padding="$4">
            <SearchBar
              value={query}
              onChangeText={setQuery}
              onClear={clearQuery}
              placeholder="Search SSH keys"
            />

            {isActuallyEmpty ? (
              <EmptyState
                title="No SSH Keys"
                description="Generate or import SSH keys for authentication."
              />
            ) : showEmpty ? (
              <SearchEmptyState query={query} />
            ) : (
              <>
                <SectionHeader title="SSH Keys" />
                <YStack gap="$3">
                  {filtered.map((key) => (
                    <KeyCard
                      key={key.id}
                      sshKey={key}
                      onEdit={() => navigation.navigate('KeyForm', { key })}
                    />
                  ))}
                </YStack>
              </>
            )}
          </YStack>
        </ScrollView>
      </Screen>

      <AddButton onPress={() => navigation.navigate('KeyForm', {})} />
    </>
  )
}
