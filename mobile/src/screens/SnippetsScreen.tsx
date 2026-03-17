import { useState } from 'react'
import { YStack } from 'tamagui'

import { AddButton, Screen, SearchBar, SearchEmptyState, SectionHeader, SnippetCard, SnippetForm } from '@/components'
import { useSearch } from '@/hooks'
import { useSnippetStore } from '@/stores'
import type { Snippet } from '@/types'

export function SnippetsScreen() {
  const snippets = useSnippetStore((state) => state.snippets)
  const addSnippet = useSnippetStore((state) => state.addSnippet)
  const updateSnippet = useSnippetStore((state) => state.updateSnippet)
  
  const [formVisible, setFormVisible] = useState(false)
  const [editingSnippet, setEditingSnippet] = useState<Snippet | undefined>()

  const { query, filtered, setQuery, clearQuery, isEmpty } = useSearch({
    items: snippets,
    fields: ['name', 'command'],
  })

  const showEmpty = query.length > 0 && isEmpty

  const handleSubmit = (data: Snippet) => {
    if (editingSnippet) {
      updateSnippet(data)
    } else {
      addSnippet(data)
    }
    setEditingSnippet(undefined)
  }

  const openForm = (snippet?: Snippet) => {
    setEditingSnippet(snippet)
    setFormVisible(true)
  }

  return (
    <>
      <Screen>
        <YStack gap="$4">
          <SearchBar
            value={query}
            onChangeText={setQuery}
            onClear={clearQuery}
            placeholder="Search snippets"
          />

          {showEmpty ? (
            <SearchEmptyState query={query} />
          ) : (
            <>
              <SectionHeader title="Command Snippets" />
              <YStack gap="$3">
                {filtered.map((snippet) => (
                  <SnippetCard 
                    key={snippet.id} 
                    snippet={snippet}
                    onEdit={() => openForm(snippet)}
                  />
                ))}
              </YStack>
            </>
          )}
        </YStack>
      </Screen>

      <AddButton onPress={() => openForm()} />

      <SnippetForm
        visible={formVisible}
        onClose={() => {
          setFormVisible(false)
          setEditingSnippet(undefined)
        }}
        onSubmit={handleSubmit}
        initialData={editingSnippet}
      />
    </>
  )
}
