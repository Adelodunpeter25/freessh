import { RefreshControl } from 'react-native'
import { Dialog, ListItem, Sheet, Text, XStack, YStack } from 'tamagui'
import { useNavigation } from '@react-navigation/native'
import { useState, useCallback } from 'react'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { Plus, Upload } from 'lucide-react-native'

import { AddButton, EmptyState, Screen, AppHeader, KeyCard, SearchBar, SearchEmptyState, SectionHeader, ConfirmDialog, Button, Input } from '@/components'
import { useSearch } from '@/hooks'
import { useConnectionStore, useKeyStore, useSnackbarStore } from '@/stores'
import type { ConnectionsStackParamList } from '@/navigation/AppNavigator'
import type { ConnectionConfig } from '@/types'

export function KeysScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ConnectionsStackParamList>>()
  const keys = useKeyStore((state) => state.keys)
  const loadKeys = useKeyStore((state) => state.initialize)
  const removeKey = useKeyStore((state) => state.removeKey)
  const exportKeyToHost = useKeyStore((state) => state.exportKeyToHost)
  const connections = useConnectionStore((state) => state.connections)
  const updateConnection = useConnectionStore((state) => state.updateConnection)
  const showSnackbar = useSnackbarStore((state) => state.show)
  const [refreshing, setRefreshing] = useState(false)
  const [exportKey, setExportKey] = useState<null | { id: string; name: string }>(null)
  const [showAddSheet, setShowAddSheet] = useState(false)
  const [exportConnection, setExportConnection] = useState<ConnectionConfig | null>(null)
  const [exportPassword, setExportPassword] = useState('')
  const [exporting, setExporting] = useState(false)
  const [confirmState, setConfirmState] = useState<{
    title: string
    description?: string
    onConfirm: () => void
  } | null>(null)

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    try {
      await loadKeys()
    } finally {
      setRefreshing(false)
    }
  }, [loadKeys])

  const { query, filtered, setQuery, clearQuery, isEmpty } = useSearch({
    items: keys,
    fields: ['name', 'algorithm'],
  })

  const showEmpty = query.length > 0 && isEmpty
  const isActuallyEmpty = keys.length === 0

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

  const resetExportFlow = useCallback(() => {
    setExportConnection(null)
    setExportPassword('')
    setExporting(false)
  }, [])

  const performExport = useCallback(async (connection: ConnectionConfig, password?: string) => {
    if (!exportKey) return

    setExporting(true)
    try {
      const updated = await exportKeyToHost(exportKey.id, connection.id, { password })
      await updateConnection(updated)
      showSnackbar(`Key installed and linked to "${connection.name}"`, 'success')
      setExportKey(null)
      resetExportFlow()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to export key'
      showSnackbar(message, 'error')
    } finally {
      setExporting(false)
    }
  }, [exportKey, exportKeyToHost, updateConnection, showSnackbar, resetExportFlow])

  const handleConnectionExport = useCallback(async (connection: ConnectionConfig) => {
    if (connection.auth_method === 'password' && !connection.password) {
      setExportConnection(connection)
      return
    }

    await performExport(connection)
  }, [performExport])

  return (
    <>
      <AppHeader 
        title="SSH Keys" 
        showBackButton 
        onBackPress={() => navigation.goBack()} 
      />
      <Screen
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <YStack
          gap="$4"
        >
          <SearchBar
            value={query}
            onChangeText={setQuery}
            onClear={clearQuery}
            placeholder="Search SSH keys"
          />

          {isActuallyEmpty ? (
            <EmptyState
              title="No SSH Keys"
              description="Generate or import SSH keys for authentication."
            />
          ) : showEmpty ? (
            <SearchEmptyState query={query} />
          ) : (
            <>
              <SectionHeader title="SSH Keys" />
              <YStack gap="$3">
                {filtered.map((key) => (
                    <KeyCard
                      key={key.id}
                      sshKey={key}
                      onEdit={() => navigation.navigate('KeyForm', { key })}
                      onExport={() => setExportKey({ id: key.id, name: key.name })}
                      onDelete={() =>
                        setConfirmState({
                          title: 'Delete key?',
                          description: `This will remove "${key.name}" from your keychain.`,
                        onConfirm: async () => {
                          try {
                            await removeKey(key.id)
                            showSnackbar(`Deleted "${key.name}"`, 'success')
                          } catch {
                            showSnackbar('Failed to delete key', 'error')
                          }
                        },
                      })
                    }
                  />
                ))}
              </YStack>
            </>
          )}
        </YStack>
      </Screen>

      <AddButton onPress={() => setShowAddSheet(true)} />

      <Sheet
        modal
        open={showAddSheet}
        onOpenChange={setShowAddSheet}
        snapPoints={[28]}
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
              title="Create New Key"
              subTitle="Generate a new SSH key pair"
              icon={<Plus size={20} />}
              onPress={() => {
                navigateFromAddSheet('KeyForm')
              }}
            />
            <ListItem
              borderWidth={1}
              borderColor="$borderColor"
              borderRadius={14}
              backgroundColor="$background"
              hoverStyle={{ backgroundColor: '$backgroundHover' }}
              pressStyle={{ backgroundColor: '$backgroundPress' }}
              title="Import Key"
              subTitle="Paste an existing private key"
              icon={<Upload size={20} />}
              onPress={() => {
                navigateFromAddSheet('ImportKey')
              }}
            />
          </YStack>
        </Sheet.Frame>
      </Sheet>

      <Sheet
        modal
        open={exportKey !== null}
        onOpenChange={(open: boolean) => {
          if (!open) {
            setExportKey(null)
            resetExportFlow()
          }
        }}
        snapPoints={[40]}
        dismissOnSnapToBottom
      >
        <Sheet.Overlay />
        <Sheet.Frame p="$4" backgroundColor="$background">
          <Sheet.Handle />
          <YStack gap="$3" pt="$4">
            <Text fontSize={14} fontWeight="700" color="$color">
              Export "{exportKey?.name}" to Host
            </Text>
            {connections.length === 0 ? (
              <Text fontSize={13} color="$placeholderColor">
                No connections available.
              </Text>
            ) : (
              connections.map((connection) => (
                <ListItem
                  key={connection.id}
                  hoverStyle={{ backgroundColor: '$backgroundHover' }}
                  pressStyle={{ backgroundColor: '$backgroundPress' }}
                  title={connection.name}
                  subTitle={`${connection.username}@${connection.host}`}
                  onPress={async () => {
                    await handleConnectionExport(connection)
                  }}
                />
              ))
            )}
          </YStack>
        </Sheet.Frame>
      </Sheet>

      <Dialog
        open={exportConnection !== null}
        onOpenChange={(open: boolean) => {
          if (!open) resetExportFlow()
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay key="overlay" opacity={0.5} backgroundColor="$shadowColor" />
          <Dialog.Content
            key="content"
            bordered
            elevate
            borderRadius="$4"
            padding="$4"
            backgroundColor="$background"
            width="85%"
            maxWidth={420}
          >
            <YStack gap="$3">
              <Dialog.Title>
                <Text fontSize={18} fontWeight="700" color="$color">
                  Enter Host Password
                </Text>
              </Dialog.Title>
              <Dialog.Description>
                <Text fontSize={14} color="$placeholderColor">
                  Password is required to install key on {exportConnection?.username}@{exportConnection?.host}.
                </Text>
              </Dialog.Description>
              <Input
                value={exportPassword}
                onChangeText={setExportPassword}
                placeholder="Password"
                secureTextEntry
              />
              <XStack gap="$2" justifyContent="flex-end">
                <Dialog.Close asChild>
                  <Button
                    bg="$background"
                    borderWidth={1}
                    borderColor="$borderColor"
                    disabled={exporting}
                  >
                    <Text color="$color">Cancel</Text>
                  </Button>
                </Dialog.Close>
                <Button
                  disabled={exporting || exportPassword.trim().length === 0 || !exportConnection}
                  onPress={async () => {
                    if (!exportConnection) return
                    await performExport(exportConnection, exportPassword)
                  }}
                >
                  <Text color="$accentText">
                    {exporting ? 'Exporting...' : 'Install Key'}
                  </Text>
                </Button>
              </XStack>
            </YStack>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog>

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
