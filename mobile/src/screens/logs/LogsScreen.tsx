import { useEffect } from 'react'
import { YStack, ScrollView, Text } from 'tamagui'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'

import { AppHeader, Screen, EmptyState, LogCard, LoadingState } from '@/components'
import { useLogStore } from '@/stores'
import type { ConnectionsStackParamList } from '@/navigation/AppNavigator'

export function LogsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ConnectionsStackParamList>>()
  const { logs, loading, initialize, removeLog } = useLogStore()

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
      
      <Screen>
        {loading ? (
          <LoadingState />
        ) : logs.length === 0 ? (
          <EmptyState 
            title="No logs found" 
            description="Stored session logs will appear here." 
          />
        ) : (
          <ScrollView showsVerticalScrollIndicator={false}>
            <YStack gap="$3" pb="$4">
              {logs.map((log) => (
                <LogCard 
                  key={log.filename} 
                  log={log} 
                  onDelete={() => removeLog(log.filename)}
                />
              ))}
            </YStack>
          </ScrollView>
        )}
      </Screen>
    </YStack>
  )
}
