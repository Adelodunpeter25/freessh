import { YStack } from 'tamagui'
import { useNavigation } from '@react-navigation/native'

import { EmptyState, Screen, AppHeader } from '@/components'

export function SessionsScreen() {
  const navigation = useNavigation()

  return (
    <>
      <AppHeader 
        title="Active Sessions" 
        showBackButton 
        onBackPress={() => navigation.goBack()} 
      />
      <Screen>
        <YStack gap="$3">
          <EmptyState
            title="No active sessions"
            description="Connect to a host to start a session."
          />
        </YStack>
      </Screen>
    </>
  )
}
