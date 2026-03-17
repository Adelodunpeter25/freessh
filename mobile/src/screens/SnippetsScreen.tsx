import { YStack } from 'tamagui'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'

import { AddButton, Screen, SearchBar, SearchEmptyState, SectionHeader, SnippetCard, AppHeader } from '@/components'
import { useSearch } from '@/hooks'
import { useSnippetStore } from '@/stores'
import type { ConnectionsStackParamList } from '@/navigation/AppNavigator'

export function SnippetsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ConnectionsStackParamList>>()
  const snippets = useSnippetStore((state) => state.snippets)

  const { query, filtered, setQuery, clearQuery, isEmpty } = useSearch({
    items: snippets,
    fields: ['name', 'command'],
  })

  const showEmpty = query.length > 0 && isEmpty

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
                    onEdit={() => navigation.navigate('SnippetForm', { snippet })}
                  />
                ))}
              </YStack>
            </>
          )}
        </YStack>
      </Screen>

      <AddButton onPress={() => navigation.navigate('SnippetForm', {})} />
    </>
  )
}
