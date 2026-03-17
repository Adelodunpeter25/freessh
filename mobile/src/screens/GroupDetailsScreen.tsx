import { YStack } from 'tamagui'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'

import { ConnectionCard, EmptyState, Screen, SectionHeader } from '../components'
import { useConnectionStore, useGroupStore } from '../stores'
import type { ConnectionsStackParamList } from '../navigation/AppNavigator'

type Props = NativeStackScreenProps<ConnectionsStackParamList, 'GroupDetails'>

export function GroupDetailsScreen({ route }: Props) {
  const { groupId } = route.params
  const group = useGroupStore((state) =>
    state.groups.find((item) => item.id === groupId)
  )
  const connections = useConnectionStore((state) =>
    state.connections.filter((item) => item.groupId === groupId)
  )

  return (
    <Screen>
      <YStack gap="$4">
        <SectionHeader title={group?.name ?? 'Group'} />
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
  )
}
