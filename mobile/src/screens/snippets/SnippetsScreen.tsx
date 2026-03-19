import React, { useState, useCallback } from 'react'
import { FlatList } from 'react-native'
import { YStack } from 'tamagui'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'

import { AddButton, SearchBar, SearchEmptyState, SectionHeader, SnippetCard, AppHeader, EmptyState, ConfirmDialog } from '@/components'
import { useSearch } from '@/hooks'
import { useSnippetStore, useSnackbarStore } from '@/stores'
import type { ConnectionsStackParamList } from '@/navigation/AppNavigator'
import type { Snippet } from '@/types'

export function SnippetsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ConnectionsStackParamList>>()
  const snippets = useSnippetStore((state) => state.snippets)
  const removeSnippet = useSnippetStore((state) => state.removeSnippet)
  const showSnackbar = useSnackbarStore((state) => state.show)
  const [confirmState, setConfirmState] = useState<{
    title: string
    description?: string
    onConfirm: () => void
  } | null>(null)

  const { query, filtered, setQuery, clearQuery, isEmpty } = useSearch({
    items: snippets,
    fields: ['name', 'command'],
  })

  const showEmpty = query.length > 0 && isEmpty
  const isActuallyEmpty = snippets.length === 0

  const renderItem = useCallback(({ item: snippet }: { item: Snippet }) => (
    <YStack px="$4" pb="$3">
      <SnippetCard 
        snippet={snippet}
        onEdit={() => navigation.navigate('SnippetForm', { snippet })}
        onDelete={() =>
          setConfirmState({
            title: 'Delete snippet?',
            description: `This will remove "${snippet.name}".`,
            onConfirm: async () => {
              try {
                await removeSnippet(snippet.id)
                showSnackbar(`Deleted "${snippet.name}"`, 'success')
              } catch {
                showSnackbar('Failed to delete snippet', 'error')
              }
            },
          })
        }
      />
    </YStack>
  ), [navigation, removeSnippet, showSnackbar])

  return (
    <>
      <YStack flex={1} bg="$background">
        <AppHeader 
          title="Snippets" 
          showBackButton 
          onBackPress={() => navigation.goBack()} 
        />
        
        <YStack flex={1} pt="$4">
          <YStack px="$4" pb="$4">
            <SearchBar
              value={query}
              onChangeText={setQuery}
              onClear={clearQuery}
              placeholder="Search snippets"
            />
          </YStack>

          {isActuallyEmpty ? (
            <YStack px="$4">
              <EmptyState
                title="No Snippets"
                description="Create reusable command snippets for quick terminal execution."
              />
            </YStack>
          ) : showEmpty ? (
            <YStack px="$4">
              <SearchEmptyState query={query} />
            </YStack>
          ) : (
            <FlatList
              data={filtered}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
              ListHeaderComponent={() => (
                <YStack px="$4" py="$2">
                  <SectionHeader title="Command Snippets" />
                </YStack>
              )}
              contentContainerStyle={{ paddingBottom: 100 }}
              removeClippedSubviews={true}
              initialNumToRender={10}
            />
          )}
        </YStack>
      </YStack>

      <AddButton onPress={() => navigation.navigate('SnippetForm', {})} />

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
