import { RefreshControl } from 'react-native'
import { YStack } from 'tamagui'
import { useNavigation } from '@react-navigation/native'
import { useState, useCallback } from 'react'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'

import { AddButton, EmptyState, Screen, AppHeader, KeyCard, SearchBar, SearchEmptyState, SectionHeader, ConfirmDialog } from '@/components'
import { useSearch } from '@/hooks'
import { useKeyStore, useSnackbarStore } from '@/stores'
import type { ConnectionsStackParamList } from '@/navigation/AppNavigator'

export function KeysScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ConnectionsStackParamList>>()
  const keys = useKeyStore((state) => state.keys)
  const loadKeys = useKeyStore((state) => state.initialize)
  const removeKey = useKeyStore((state) => state.removeKey)
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
      <Screen
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <YStack
          gap="$4"
        >
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
                    onDelete={() =>
                      setConfirmState({
                        title: 'Delete key?',
                        description: `This will remove "${key.name}" from your keychain.`,
                        onConfirm: async () => {
                          try {
                            await removeKey(key.id)
                            showSnackbar(`Deleted "${key.name}"`, 'success')
                          } catch {
                            showSnackbar('Failed to delete key', 'error')
                          }
                        },
                      })
                    }
                  />
                ))}
              </YStack>
            </>
          )}
        </YStack>
      </Screen>

      <AddButton onPress={() => navigation.navigate('KeyForm', {})} />

      <ConfirmDialog
        open={confirmState !== null}
        onOpenChange={(open) => {
          if (!open) setConfirmState(null)
        }}
        title={confirmState?.title ?? ''}
        description={confirmState?.description}
        destructive
        onConfirm={() => {
          confirmState?.onConfirm()
          setConfirmState(null)
        }}
      />
    </>
  )
}
