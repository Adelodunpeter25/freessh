import { YStack } from 'tamagui'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'

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
import type { ConnectionsStackParamList } from '../navigation/AppNavigator'

export function ConnectionsScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<ConnectionsStackParamList>>()
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
              {groups.map((group) => (
                <GroupCard
                  key={group.id}
                  group={group}
                  onPress={() =>
                    navigation.navigate('GroupDetails', { groupId: group.id })
                  }
                />
              ))}
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
