import { RefreshControl, SectionList } from 'react-native'
import { YStack, ListItem } from 'tamagui'
import { FolderPlus, Server } from 'lucide-react-native'
import React, { useState, useCallback, useMemo } from 'react'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'

import {
  AddButton,
  ConnectionCard,
  EmptyState,
  GroupCard,
  SearchBar,
  SearchEmptyState,
  SectionHeader,
  ConfirmDialog,
  Sheet,
} from '@/components'
import { useSearch } from '@/hooks'
import { useConnectionStore, useGroupStore, useSftpStore, useSnackbarStore, useTerminalStore } from '@/stores'
import type { ConnectionsStackParamList } from '@/navigation/AppNavigator'
import type { ConnectionConfig } from '@/types'

export function ConnectionsScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<ConnectionsStackParamList>>()
  const connections = useConnectionStore((state) => state.connections)
  const groups = useGroupStore((state) => state.groups)
  const loadConnections = useConnectionStore((state) => state.initialize)
  const loadGroups = useGroupStore((state) => state.initialize)
  const removeGroup = useGroupStore((state) => state.removeGroup)
  const removeConnection = useConnectionStore((state) => state.removeConnection)
  const duplicateConnection = useConnectionStore((state) => state.duplicateConnection)
  const connectSftp = useSftpStore((state) => state.connect)
  const sftpConnectingByConnectionId = useSftpStore((state) => state.connectingByConnectionId)
  const showSnackbar = useSnackbarStore((state) => state.show)
  const openTerminalSession = useTerminalStore((state) => state.openSession)
  const setActiveSession = useTerminalStore((state) => state.setActiveSession)
  const connectingByConnectionId = useTerminalStore((state) => state.connectingByConnectionId)
  const [showAddSheet, setShowAddSheet] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [confirmState, setConfirmState] = useState<{
    title: string
    description?: string
    onConfirm: () => void
  } | null>(null)

  const handleConnect = useCallback(async (connection: ConnectionConfig, mode: 'ssh' | 'sftp') => {
    try {
      if (mode === 'sftp') {
        await connectSftp(connection)
        showSnackbar(`SFTP connected to "${connection.name}"`, 'success')
        // @ts-ignore
        navigation.navigate('Sftp')
      } else {
        const sessionId = await openTerminalSession(connection)
        setActiveSession(sessionId)
        showSnackbar(`Connected to "${connection.name}"`, 'success')
        // @ts-ignore
        navigation.navigate('Sessions')
      }
    } catch (error) {
      const detail =
        error instanceof Error && error.message.trim().length > 0
          ? `: ${error.message}`
          : ''
      showSnackbar(`Failed to connect to "${connection.name}"${detail}`, 'error')
    }
  }, [connectSftp, openTerminalSession, setActiveSession, showSnackbar, navigation])

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

  const sections = useMemo(() => {
    const res = []
    if (groups.length > 0 && query.length === 0) {
      res.push({
        title: 'Groups',
        data: groupsWithCounts,
        type: 'group'
      })
    }
    if (ungroupedConnections.length > 0) {
      res.push({
        title: 'Connections',
        data: ungroupedConnections,
        type: 'connection'
      })
    }
    return res
  }, [groups.length, query.length, groupsWithCounts, ungroupedConnections])

  const displayFlags = useMemo(() => ({
    showEmpty: query.length > 0 && isEmpty,
    isActuallyEmpty: connections.length === 0 && groups.length === 0
  }), [query.length, isEmpty, connections.length, groups.length])

  const navigateFromAddSheet = useCallback(
    (screen: keyof ConnectionsStackParamList, params?: object) => {
      setShowAddSheet(false)
      setTimeout(() => {
        // @ts-ignore react-navigation param typing is strict here
        navigation.navigate(screen, params ?? {})
      }, 180)
    },
    [navigation],
  )

  const renderItem = useCallback(({ item, section }: { item: any, section: any }) => {
    if (section.type === 'group') {
      return (
        <YStack px="$4" pb="$3">
          <GroupCard
            group={item}
            onPress={() =>
              navigation.navigate('GroupDetails', { groupId: item.id })
            }
            onEdit={() => navigation.navigate('GroupForm', { group: item })}
            onDelete={() =>
              setConfirmState({
                title: 'Delete group?',
                description: `This will remove "${item.name}" and ungroup its connections.`,
                onConfirm: async () => {
                  try {
                    await removeGroup(item.id)
                    showSnackbar(`Deleted "${item.name}"`, 'success')
                  } catch {
                    showSnackbar('Failed to delete group', 'error')
                  }
                },
              })
            }
          />
        </YStack>
      )
    }

    return (
      <YStack px="$4" pb="$3">
        <ConnectionCard 
          connection={item}
          loading={
            !!connectingByConnectionId[item.id] ||
            !!sftpConnectingByConnectionId[item.id]
          }
          onPress={() => handleConnect(item, 'ssh')}
          onEdit={() => navigation.navigate('ConnectionForm', { connection: item })}
          onDelete={() =>
            setConfirmState({
              title: 'Delete connection?',
              description: `This will remove "${item.name}" from your saved connections.`,
              onConfirm: async () => {
                try {
                  await removeConnection(item.id)
                  showSnackbar(`Deleted "${item.name}"`, 'success')
                } catch {
                  showSnackbar('Failed to delete connection', 'error')
                }
              },
            })
          }
          onDuplicate={async () => {
            try {
              const copy = await duplicateConnection(item)
              showSnackbar(`Created "${copy.name}"`, 'success')
            } catch {
              showSnackbar('Failed to duplicate connection', 'error')
            }
          }}
          onConnect={() => handleConnect(item, 'ssh')}
          onOpenSftp={() => handleConnect(item, 'sftp')}
        />
      </YStack>
    )
  }, [
    navigation, 
    removeGroup, 
    showSnackbar, 
    removeConnection, 
    duplicateConnection, 
    connectingByConnectionId, 
    sftpConnectingByConnectionId, 
    handleConnect
  ])

  return (
    <>
      <YStack flex={1} bg="$background">
        <YStack gap="$4" pt="$4">
          <YStack px="$4">
            <SearchBar
              value={query}
              onChangeText={setQuery}
              onClear={clearQuery}
              placeholder="Search connections"
            />
          </YStack>

          {displayFlags.isActuallyEmpty ? (
            <YStack px="$4">
              <EmptyState
                title="No Connections"
                description="Add your first host or group to get started with SSH."
              />
            </YStack>
          ) : displayFlags.showEmpty ? (
            <YStack px="$4">
              <SearchEmptyState query={query} />
            </YStack>
          ) : (
            <SectionList
              sections={sections}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              renderSectionHeader={({ section: { title } }) => (
                <YStack px="$4" py="$2" bg="$background">
                  <SectionHeader title={title} />
                </YStack>
              )}
              stickySectionHeadersEnabled={false}
              contentContainerStyle={{ paddingBottom: 100 }}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
              removeClippedSubviews={true}
              initialNumToRender={10}
            />
          )}
        </YStack>
      </YStack>

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
              borderWidth={1}
              borderColor="$borderColor"
              borderRadius={14}
              backgroundColor="$background"
              hoverStyle={{ backgroundColor: '$backgroundHover' }}
              pressStyle={{ backgroundColor: '$backgroundPress' }}
              title="New Connection"
              subTitle="Add a new SSH host"
              icon={<Server size={20} />}
              onPress={() => {
                navigateFromAddSheet('ConnectionForm')
              }}
            />
            <ListItem
              borderWidth={1}
              borderColor="$borderColor"
              borderRadius={14}
              backgroundColor="$background"
              hoverStyle={{ backgroundColor: '$backgroundHover' }}
              pressStyle={{ backgroundColor: '$backgroundPress' }}
              title="New Group"
              subTitle="Organize your hosts"
              icon={<FolderPlus size={20} />}
              onPress={() => {
                navigateFromAddSheet('GroupForm')
              }}
            />
          </YStack>
        </Sheet.Frame>
      </Sheet>

      <ConfirmDialog
        open={confirmState !== null}
        onOpenChange={(open) => {
          if (!open) setConfirmState(null)
        }}
        title={confirmState?.title ?? ''}
        description={confirmState?.description}
        destructive
        onConfirm={() => {
          confirmState?.onConfirm()
          setConfirmState(null)
        }}
      />
    </>
  )
}
