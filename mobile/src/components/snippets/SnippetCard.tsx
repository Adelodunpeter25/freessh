import { MoreHorizontal } from 'lucide-react-native'
import { Text, XStack, YStack, useTheme } from 'tamagui'

import { Card, IconButton } from '../common'
import type { Snippet } from '../../types'

type SnippetCardProps = {
  snippet: Snippet
}

export function SnippetCard({ snippet }: SnippetCardProps) {
  const theme = useTheme()

  return (
    <Card gap="$2">
      <XStack justifyContent="space-between" alignItems="center">
        <YStack>
          <Text fontSize={15} fontWeight="700">
            {snippet.title}
          </Text>
          {snippet.description ? (
            <Text fontSize={12} color="$placeholderColor">
              {snippet.description}
            </Text>
          ) : null}
        </YStack>
        <IconButton>
          <MoreHorizontal size={18} color={theme.color.get()} />
        </IconButton>
      </XStack>
      <Text fontSize={12} color="$color" numberOfLines={2}>
        {snippet.command}
      </Text>
    </Card>
  )
}
