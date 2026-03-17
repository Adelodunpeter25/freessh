import { YStack } from 'tamagui'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'

import {
  AddButton,
  ConnectionCard,
  EmptyState,
  GroupCard,
  Screen,
  SearchBar,
  SearchEmptyState,
  SectionHeader,
  Spacer,
} from '@/components'
import { useSearch } from '@/hooks'
import { useConnectionStore, useGroupStore } from '@/stores'
import type { ConnectionsStackParamList } from '@/navigation/AppNavigator'
import type { ConnectionConfig, Group } from '@/types'

export function ConnectionsScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<ConnectionsStackParamList>>()
  const connections = useConnectionStore((state) => state.connections)
  const groups = useGroupStore((state) => state.groups)

  const { query, filtered, setQuery, clearQuery, isEmpty } = useSearch({
    items: connections,
    fields: ['name', 'host', 'username'],
  })

  // Filter out connections that belong to a group
  const ungroupedConnections = filtered.filter((conn) => !conn.group)
  const showGroups = groups.length > 0 && query.length === 0
  const showConnections = ungroupedConnections.length > 0
  const showEmpty = query.length > 0 && isEmpty
  const isActuallyEmpty = connections.length === 0 && groups.length === 0

  return (
    <>
      <Screen>
        <YStack gap="$4">
          <SearchBar
            value={query}
            onChangeText={setQuery}
            onClear={clearQuery}
            placeholder="Search connections"
          />

          {isActuallyEmpty ? (
            <EmptyState
              title="No Connections"
              description="Add your first host or group to get started with SSH."
            />
          ) : showEmpty ? (
            <SearchEmptyState query={query} />
          ) : (
            <>
              {showGroups && (
                <>
                  <SectionHeader title="Groups" />
                  <YStack gap="$3">
                    {groups.map((group) => (
                      <GroupCard
                        key={group.id}
                        group={group}
                        onPress={() =>
                          navigation.navigate('GroupDetails', { groupId: group.id })
                        }
                        onEdit={() => navigation.navigate('GroupForm', { group })}
                      />
                    ))}
                  </YStack>
                  {showConnections && <Spacer height="$4" />}
                </>
              )}

              {showConnections && (
                <>
                  <SectionHeader title="Connections" />
                  <YStack gap="$3">
                    {ungroupedConnections.map((connection) => (
                      <ConnectionCard 
                        key={connection.id} 
                        connection={connection}
                        onEdit={() => navigation.navigate('ConnectionForm', { connection })}
                      />
                    ))}
                  </YStack>
                </>
              )}
            </>
          )}
        </YStack>
      </Screen>

      <AddButton onPress={() => navigation.navigate('ConnectionForm', {})} />
    </>
  )
}
