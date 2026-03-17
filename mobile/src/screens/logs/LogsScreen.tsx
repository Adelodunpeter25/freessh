import { useEffect, useState, useCallback } from 'react'
import { RefreshControl } from 'react-native'
import { YStack } from 'tamagui'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'

import { AppHeader, Screen, EmptyState, LogCard, LoadingState, SearchBar, SearchEmptyState, SectionHeader, ConfirmDialog } from '@/components'
import { useSearch } from '@/hooks'
import { useLogStore, useSnackbarStore } from '@/stores'
import type { ConnectionsStackParamList } from '@/navigation/AppNavigator'

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

  return (
    <YStack flex={1}>
      <AppHeader 
        title="Session Logs" 
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
              placeholder="Search logs"
            />

            {logs.length === 0 ? (
              <EmptyState 
                title="No logs found" 
                description="Stored session logs will appear here." 
              />
            ) : showEmpty ? (
              <SearchEmptyState query={query} />
            ) : (
              <>
                <SectionHeader title="Session Logs" />
                <YStack gap="$3">
                    {filtered.map((log) => (
                      <LogCard 
                        key={log.filename} 
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
                    ))}
                  </YStack>
                </>
              )}
            </YStack>
        )}
      </Screen>

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
    </YStack>
  )
}
