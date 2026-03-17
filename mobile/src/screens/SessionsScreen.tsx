import { YStack } from 'tamagui'

import { EmptyState, Screen } from '../components'

export function SessionsScreen() {
  return (
    <Screen>
      <YStack gap="$3">
        <EmptyState
          title="No active sessions"
          description="Connect to a host to start a session."
        />
      </YStack>
    </Screen>
  )
}
