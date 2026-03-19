import { useState } from 'react'
import { YStack } from 'tamagui'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'

import { AddButton, Screen, SearchBar, SearchEmptyState, SectionHeader, SnippetCard, AppHeader, EmptyState, ConfirmDialog } from '@/components'
import { useSearch } from '@/hooks'
import { useSnippetStore, useSnackbarStore } from '@/stores'
import type { ConnectionsStackParamList } from '@/navigation/AppNavigator'

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

  return (
    <>
      <AppHeader 
        title="Snippets" 
        showBackButton 
        onBackPress={() => navigation.goBack()} 
      />
      <Screen>
        <YStack gap="$4">
          <SearchBar
            value={query}
            onChangeText={setQuery}
            onClear={clearQuery}
            placeholder="Search snippets"
          />

          {isActuallyEmpty ? (
            <EmptyState
              title="No Snippets"
              description="Create reusable command snippets for quick terminal execution."
            />
          ) : showEmpty ? (
            <SearchEmptyState query={query} />
          ) : (
            <>
              <SectionHeader title="Command Snippets" />
              <YStack gap="$3">
                {filtered.map((snippet) => (
                  <SnippetCard 
                    key={snippet.id} 
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
                ))}
              </YStack>
            </>
          )}
        </YStack>
      </Screen>

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
