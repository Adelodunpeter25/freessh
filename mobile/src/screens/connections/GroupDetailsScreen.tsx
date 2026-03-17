import { useMemo } from 'react'
import { YStack } from 'tamagui'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'

import { AppHeader, ConnectionCard, EmptyState, Screen, SectionHeader } from '@/components'
import { useConnectionStore, useGroupStore } from '@/stores'
import type { ConnectionsStackParamList } from '@/navigation/AppNavigator'

type Props = NativeStackScreenProps<ConnectionsStackParamList, 'GroupDetails'>

export function GroupDetailsScreen({ route, navigation }: Props) {
  const { groupId } = route.params
  const group = useGroupStore((state) =>
    state.groups.find((item) => item.id === groupId)
  )
  const allConnections = useConnectionStore((state) => state.connections)
  const connections = useMemo(
    () => allConnections.filter((item) => item.group === groupId),
    [allConnections, groupId]
  )

  return (
    <YStack flex={1}>
      <AppHeader 
        title={group?.name ?? 'Group Details'} 
        showBackButton 
        onBackPress={() => navigation.goBack()} 
      />
      <Screen>
        <YStack gap="$4">
          {connections.length === 0 ? (
            <EmptyState
              title="No connections"
              description="This group doesn't have any connections yet."
            />
          ) : (
            <YStack gap="$3">
              {connections.map((connection) => (
                <ConnectionCard key={connection.id} connection={connection} />
              ))}
            </YStack>
          )}
        </YStack>
      </Screen>
    </YStack>
  )
}
