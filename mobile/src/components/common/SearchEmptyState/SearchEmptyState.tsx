import { Text } from 'tamagui'

import { EmptyState } from '../EmptyState'

export type SearchEmptyStateProps = {
  query?: string
}

export function SearchEmptyState({ query }: SearchEmptyStateProps) {
  return (
    <EmptyState
      title="No results"
      description={query ? `No results for "${query}"` : 'Try a different search'}
      icon={<Text fontSize={20}>🔍</Text>}
    />
  )
}
