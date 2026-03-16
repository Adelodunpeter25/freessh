import { ScrollView } from 'react-native'
import { YStack } from 'tamagui'

import { SearchBar, SearchEmptyState, SnippetCard } from '../components'
import { useSearch } from '../hooks'
import { useSnippetStore } from '../stores'

export function SnippetsScreen() {
  const snippets = useSnippetStore((state) => state.snippets)
  const { query, filtered, setQuery, clearQuery, isEmpty } = useSearch({
    items: snippets,
    fields: ['title', 'command', 'description'],
  })

  const showEmpty = query.length > 0 && isEmpty

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <YStack gap="$3">
        <SearchBar
          value={query}
          onChangeText={setQuery}
          onClear={clearQuery}
          placeholder="Search snippets"
        />

        {showEmpty ? (
          <SearchEmptyState query={query} />
        ) : (
          filtered.map((snippet) => (
            <SnippetCard key={snippet.id} snippet={snippet} />
          ))
        )}
      </YStack>
    </ScrollView>
  )
}
