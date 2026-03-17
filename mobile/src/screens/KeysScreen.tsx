import { YStack } from 'tamagui'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'

import { AddButton, EmptyState, Screen } from '@/components'
import type { ConnectionsStackParamList } from '@/navigation/AppNavigator'

export function KeysScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ConnectionsStackParamList>>()

  return (
    <>
      <Screen>
        <YStack gap="$4">
          <EmptyState
            title="No SSH Keys"
            description="Generate or import SSH keys for authentication."
          />
        </YStack>
      </Screen>

      <AddButton onPress={() => navigation.navigate('KeyForm', {})} />
    </>
  )
}
