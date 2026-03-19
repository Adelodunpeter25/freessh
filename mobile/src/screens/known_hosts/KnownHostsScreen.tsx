import React, { useEffect, useState, useCallback } from 'react'
import { RefreshControl, FlatList } from 'react-native'
import { YStack } from 'tamagui'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'

import { AppHeader, EmptyState, KnownHostCard, LoadingState, SearchBar, SearchEmptyState, SectionHeader, ConfirmDialog } from '@/components'
import { useSearch } from '@/hooks'
import { useKnownHostStore, useSnackbarStore } from '@/stores'
import type { ConnectionsStackParamList } from '@/navigation/AppNavigator'
import type { KnownHost } from '@/types'

export function KnownHostsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ConnectionsStackParamList>>()
  const { knownHosts, loading, initialize, removeKnownHost } = useKnownHostStore()
  const showSnackbar = useSnackbarStore((state) => state.show)
  const [refreshing, setRefreshing] = useState(false)
  const [confirmState, setConfirmState] = useState<{
    title: string
    description?: string
    onConfirm: () => void
  } | null>(null)

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

  const renderItem = useCallback(({ item: host }: { item: KnownHost }) => (
    <YStack px="$4" pb="$3">
      <KnownHostCard 
        host={host} 
        onDelete={() =>
          setConfirmState({
            title: 'Delete known host?',
            description: `This will remove "${host.hostname}".`,
            onConfirm: async () => {
              try {
                await removeKnownHost(host.id)
                showSnackbar(`Deleted "${host.hostname}"`, 'success')
              } catch {
                showSnackbar('Failed to delete host', 'error')
              }
            },
          })
        }
      />
    </YStack>
  ), [removeKnownHost, showSnackbar])

  return (
    <YStack flex={1} bg="$background">
      <AppHeader 
        title="Known Hosts" 
        showBackButton 
        onBackPress={() => navigation.goBack()} 
      />
      
      {loading ? (
        <LoadingState />
      ) : (
        <YStack flex={1} pt="$4">
          <YStack px="$4" pb="$4">
            <SearchBar
              value={query}
              onChangeText={setQuery}
              onClear={clearQuery}
              placeholder="Search known hosts"
            />
          </YStack>

          {knownHosts.length === 0 ? (
            <YStack px="$4">
              <EmptyState 
                title="No known hosts" 
                description="Verified host fingerprints will be saved here." 
              />
            </YStack>
          ) : showEmpty ? (
            <YStack px="$4">
              <SearchEmptyState query={query} />
            </YStack>
          ) : (
            <FlatList
              data={filtered}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
              ListHeaderComponent={() => (
                <YStack px="$4" py="$2">
                  <SectionHeader title="Known Hosts" />
                </YStack>
              )}
              contentContainerStyle={{ paddingBottom: 40 }}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
              removeClippedSubviews={true}
              initialNumToRender={10}
            />
          )}
        </YStack>
      )}

      {confirmState && (
        <ConfirmDialog
          open={!!confirmState}
          onOpenChange={(open) => !open && setConfirmState(null)}
          title={confirmState.title}
          description={confirmState.description}
          destructive
          onConfirm={() => {
            confirmState.onConfirm()
            setConfirmState(null)
          }}
        />
      )}
    </YStack>
  )
}
