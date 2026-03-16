import { ScrollView } from 'react-native'
import { YStack } from 'tamagui'

import { EmptyState } from '../components'

export function SessionsScreen() {
  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <YStack gap="$3">
        <EmptyState
          title="No active sessions"
          description="Connect to a host to start a session."
        />
      </YStack>
    </ScrollView>
  )
}
