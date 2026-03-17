import { YStack } from 'tamagui'

import {
  ConnectionCard,
  GroupCard,
  Screen,
  SearchBar,
  SearchEmptyState,
  SectionHeader,
  Spacer,
} from '../components'
import { useSearch } from '../hooks'
import { useConnectionStore, useGroupStore } from '../stores'

export function ConnectionsScreen() {
  const connections = useConnectionStore((state) => state.connections)
  const groups = useGroupStore((state) => state.groups)
  const { query, filtered, setQuery, clearQuery, isEmpty } = useSearch({
    items: connections,
    fields: ['name', 'host', 'username'],
  })

  const showEmpty = query.length > 0 && isEmpty

  return (
    <Screen>
      <YStack gap="$4">
        <SearchBar
          value={query}
          onChangeText={setQuery}
          onClear={clearQuery}
          placeholder="Search connections"
        />

        {showEmpty ? (
          <SearchEmptyState query={query} />
        ) : (
          <>
            <SectionHeader title="Groups" />
            <YStack gap="$3">
              {groups.map((group) => {
                const count = connections.filter(
                  (item) => item.groupId === group.id
                ).length
                return (
                  <GroupCard
                    key={group.id}
                    group={group}
                    connectionCount={count}
                  />
                )
              })}
            </YStack>

            <Spacer height="$4" />

            <SectionHeader title="Connections" />
            <YStack gap="$3">
              {filtered.map((connection) => (
                <ConnectionCard key={connection.id} connection={connection} />
              ))}
            </YStack>
          </>
        )}
      </YStack>
    </Screen>
  )
}
