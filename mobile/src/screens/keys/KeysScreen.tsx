import { YStack, Text } from 'tamagui'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'

import { AddButton, EmptyState, Screen, AppHeader, KeyCard } from '@/components'
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
               {keys.map(key => (
                 <KeyCard 
                   key={key.id} 
                   sshKey={key} 
                   onEdit={() => navigation.navigate('KeyForm', { key })}
                 />
               ))}
             </YStack>
          )}
        </YStack>
      </Screen>

      <AddButton onPress={() => navigation.navigate('KeyForm', {})} />
    </>
  )
}
