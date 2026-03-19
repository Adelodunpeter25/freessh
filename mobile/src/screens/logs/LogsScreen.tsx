import React, { useEffect, useState, useCallback } from 'react'
import { RefreshControl, FlatList } from 'react-native'
import { YStack } from 'tamagui'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'

import { AppHeader, EmptyState, LogCard, LoadingState, SearchBar, SearchEmptyState, SectionHeader, ConfirmDialog } from '@/components'
import { useSearch } from '@/hooks'
import { useLogStore, useSnackbarStore } from '@/stores'
import type { ConnectionsStackParamList } from '@/navigation/AppNavigator'
import type { LogEntry } from '@/types'

export function LogsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ConnectionsStackParamList>>()
  const { logs, loading, initialize, removeLog } = useLogStore()
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
    items: logs,
    fields: ['filename', 'connection_name'],
  })

  const showEmpty = query.length > 0 && isEmpty

  useEffect(() => {
    initialize()
  }, [])

  const renderItem = useCallback(({ item: log }: { item: LogEntry }) => (
    <YStack px="$4" pb="$3">
      <LogCard 
        log={log} 
        onDelete={() =>
          setConfirmState({
            title: 'Delete log?',
            description: `This will remove "${log.filename}".`,
            onConfirm: async () => {
              try {
                await removeLog(log.filename)
                showSnackbar(`Deleted "${log.filename}"`, 'success')
              } catch {
                showSnackbar('Failed to delete log', 'error')
              }
            },
          })
        }
      />
    </YStack>
  ), [removeLog, showSnackbar])

  return (
    <YStack flex={1} bg="$background">
      <AppHeader 
        title="Session Logs" 
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
              placeholder="Search logs"
            />
          </YStack>

          {logs.length === 0 ? (
            <YStack px="$4">
              <EmptyState 
                title="No logs found" 
                description="Stored session logs will appear here." 
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
              keyExtractor={(item) => item.filename}
              ListHeaderComponent={() => (
                <YStack px="$4" py="$2">
                  <SectionHeader title="Session Logs" />
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
