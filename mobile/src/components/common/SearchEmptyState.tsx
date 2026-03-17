import { Search } from 'lucide-react-native'
import { useTheme } from 'tamagui'

import { EmptyState } from '../EmptyState'

export type SearchEmptyStateProps = {
  query?: string
}

export function SearchEmptyState({ query }: SearchEmptyStateProps) {
  const theme = useTheme()

  return (
    <EmptyState
      title="No results"
      description={query ? `No results for "${query}"` : 'Try a different search'}
      icon={<Search size={20} color={theme.color.get()} />}
    />
  )
}
