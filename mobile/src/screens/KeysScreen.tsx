import { YStack, Text } from 'tamagui'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'

import { AddButton, EmptyState, Screen, AppHeader } from '@/components'
import type { ConnectionsStackParamList } from '@/navigation/AppNavigator'

import { useKeyStore } from '@/stores'

export function KeysScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ConnectionsStackParamList>>()
  const keys = useKeyStore((state) => state.keys)
  const isActuallyEmpty = keys.length === 0

  return (
    <>
      <AppHeader 
        title="SSH Keys" 
        showBackButton 
        onBackPress={() => navigation.goBack()} 
      />
      <Screen>
        <YStack gap="$4">
          {isActuallyEmpty ? (
             <EmptyState
               title="No SSH Keys"
               description="Generate or import SSH keys for authentication."
             />
          ) : (
             <YStack gap="$3">
               {/* Key list items would go here - for now keeping focus on empty state per user request */}
               {keys.map(key => (
                 <YStack key={key.id} p="$4" bg="$backgroundStrong" borderRadius={12} borderWidth={1} borderColor="$borderColor">
                    <Text fontWeight="600">{key.name}</Text>
                    <Text fontSize={12} opacity={0.6}>{key.algorithm} • {key.bits ? `${key.bits} bits` : 'Standard'}</Text>
                 </YStack>
               ))}
             </YStack>
          )}
        </YStack>
      </Screen>

      <AddButton onPress={() => navigation.navigate('KeyForm', {})} />
    </>
  )
}
