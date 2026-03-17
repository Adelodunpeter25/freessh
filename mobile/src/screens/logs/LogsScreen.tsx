import { useEffect, useState, useCallback } from 'react'
import { RefreshControl } from 'react-native'
import { YStack } from 'tamagui'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'

import { AppHeader, Screen, EmptyState, LogCard, LoadingState, SearchBar, SearchEmptyState, SectionHeader } from '@/components'
import { useSearch } from '@/hooks'
import { useLogStore } from '@/stores'
import type { ConnectionsStackParamList } from '@/navigation/AppNavigator'

export function LogsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ConnectionsStackParamList>>()
  const { logs, loading, initialize, removeLog } = useLogStore()
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
                      onDelete={() => removeLog(log.filename)}
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
