import { YStack } from 'tamagui'

import { Screen, SearchBar, SearchEmptyState, SnippetCard } from '../components'
import { useSearch } from '../hooks'
import { useSnippetStore } from '../stores'

export function SnippetsScreen() {
  const snippets = useSnippetStore((state) => state.snippets)
  const { query, filtered, setQuery, clearQuery, isEmpty } = useSearch({
    items: snippets,
    fields: ['name', 'command'],
  })

  const showEmpty = query.length > 0 && isEmpty

  return (
    <Screen>
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
    </Screen>
  )
}
