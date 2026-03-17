import { RefreshControl } from 'react-native'
import { Sheet, YStack, Text, ListItem } from 'tamagui'
import { Plus, FolderPlus, Server } from 'lucide-react-native'
import { useState, useCallback, useMemo } from 'react'
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
  const loadConnections = useConnectionStore((state) => state.initialize)
  const loadGroups = useGroupStore((state) => state.initialize)
  const [showAddSheet, setShowAddSheet] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    try {
      await Promise.all([loadConnections(), loadGroups()])
    } finally {
      setRefreshing(false)
    }
  }, [loadConnections, loadGroups])

  const { query, filtered, setQuery, clearQuery, isEmpty } = useSearch({
    items: connections,
    fields: ['name', 'host', 'username'],
  })

  // Memoize expensive calculations
  const ungroupedConnections = useMemo(() => 
    filtered.filter((conn) => !conn.group), [filtered]
  )

  const groupsWithCounts = useMemo(() => 
    groups.map((group) => ({
      ...group,
      connection_count: connections.filter((conn) => conn.group === group.id).length
    })), [groups, connections]
  )

  const displayFlags = useMemo(() => ({
    showGroups: groups.length > 0 && query.length === 0,
    showConnections: ungroupedConnections.length > 0,
    showEmpty: query.length > 0 && isEmpty,
    isActuallyEmpty: connections.length === 0 && groups.length === 0
  }), [groups.length, query.length, ungroupedConnections.length, isEmpty, connections.length])

  return (
    <>
      <Screen
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <YStack gap="$4">
          <SearchBar
            value={query}
            onChangeText={setQuery}
            onClear={clearQuery}
            placeholder="Search connections"
          />

          {displayFlags.isActuallyEmpty ? (
            <EmptyState
              title="No Connections"
              description="Add your first host or group to get started with SSH."
            />
          ) : displayFlags.showEmpty ? (
            <SearchEmptyState query={query} />
          ) : (
            <>
              {displayFlags.showGroups && (
                <>
                  <SectionHeader title="Groups" />
                  <YStack gap="$3">
                    {groupsWithCounts.map((group) => (
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
                  {displayFlags.showConnections && <Spacer height="$4" />}
                </>
              )}

              {displayFlags.showConnections && (
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

      <AddButton onPress={() => setShowAddSheet(true)} />

      <Sheet
        modal
        open={showAddSheet}
        onOpenChange={setShowAddSheet}
        snapPoints={[25]}
        dismissOnSnapToBottom
      >
        <Sheet.Overlay />
        <Sheet.Frame p="$4" backgroundColor="$background">
          <Sheet.Handle />
          <YStack gap="$2" pt="$4">
            <ListItem
              hoverStyle={{ backgroundColor: '$backgroundHover' }}
              pressStyle={{ backgroundColor: '$backgroundPress' }}
              title="New Connection"
              subTitle="Add a new SSH host"
              icon={<Server size={20} />}
              onPress={() => {
                setShowAddSheet(false)
                navigation.navigate('ConnectionForm', {})
              }}
            />
            <ListItem
              hoverStyle={{ backgroundColor: '$backgroundHover' }}
              pressStyle={{ backgroundColor: '$backgroundPress' }}
              title="New Group"
              subTitle="Organize your hosts"
              icon={<FolderPlus size={20} />}
              onPress={() => {
                setShowAddSheet(false)
                navigation.navigate('GroupForm', {})
              }}
            />
          </YStack>
        </Sheet.Frame>
      </Sheet>
    </>
  )
}
