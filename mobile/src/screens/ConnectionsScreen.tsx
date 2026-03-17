import { useState } from 'react'
import { YStack } from 'tamagui'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'

import {
  AddButton,
  ConnectionCard,
  ConnectionForm,
  GroupCard,
  GroupForm,
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
  const addConnection = useConnectionStore((state) => state.addConnection)
  const updateConnection = useConnectionStore((state) => state.updateConnection)
  const groups = useGroupStore((state) => state.groups)
  const addGroup = useGroupStore((state) => state.addGroup)
  const updateGroup = useGroupStore((state) => state.updateGroup)
  
  const [connectionFormVisible, setConnectionFormVisible] = useState(false)
  const [groupFormVisible, setGroupFormVisible] = useState(false)
  const [editingConnection, setEditingConnection] = useState<ConnectionConfig | undefined>()
  const [editingGroup, setEditingGroup] = useState<Group | undefined>()

  const { query, filtered, setQuery, clearQuery, isEmpty } = useSearch({
    items: connections,
    fields: ['name', 'host', 'username'],
  })

  const showEmpty = query.length > 0 && isEmpty

  const handleConnectionSubmit = (data: ConnectionConfig) => {
    if (editingConnection) {
      updateConnection(data)
    } else {
      addConnection(data)
    }
    setEditingConnection(undefined)
  }

  const handleGroupSubmit = (data: Group) => {
    if (editingGroup) {
      updateGroup(data)
    } else {
      addGroup(data)
    }
    setEditingGroup(undefined)
  }

  const openConnectionForm = (connection?: ConnectionConfig) => {
    setEditingConnection(connection)
    setConnectionFormVisible(true)
  }

  const openGroupForm = (group?: Group) => {
    setEditingGroup(group)
    setGroupFormVisible(true)
  }

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
                    onEdit={() => openGroupForm(group)}
                  />
                ))}
              </YStack>

              <Spacer height="$4" />

              <SectionHeader title="Connections" />
              <YStack gap="$3">
                {filtered.map((connection) => (
                  <ConnectionCard 
                    key={connection.id} 
                    connection={connection}
                    onEdit={() => openConnectionForm(connection)}
                  />
                ))}
              </YStack>
            </>
          )}
        </YStack>
      </Screen>

      <AddButton onPress={() => openConnectionForm()} />

      <ConnectionForm
        visible={connectionFormVisible}
        onClose={() => {
          setConnectionFormVisible(false)
          setEditingConnection(undefined)
        }}
        onSubmit={handleConnectionSubmit}
        initialData={editingConnection}
      />

      <GroupForm
        visible={groupFormVisible}
        onClose={() => {
          setGroupFormVisible(false)
          setEditingGroup(undefined)
        }}
        onSubmit={handleGroupSubmit}
        initialData={editingGroup}
      />
    </>
  )
}
