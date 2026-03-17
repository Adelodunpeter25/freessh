import { MoreHorizontal } from 'lucide-react-native'
import { Pressable } from 'react-native'
import { Text, XStack, YStack, useTheme } from 'tamagui'

import { Badge, Card, IconButton } from '../common'
import type { Group } from '../../types'

type GroupCardProps = {
  group: Group
  connectionCount?: number
  onOpen?: () => void
}

export function GroupCard({ group, connectionCount = 0, onOpen }: GroupCardProps) {
  const theme = useTheme()

  return (
    <Pressable onPress={onOpen}>
      <Card gap="$3">
        <XStack justifyContent="space-between" alignItems="center">
          <YStack>
            <Text fontSize={16} fontWeight="700">
              {group.name}
            </Text>
            {group.description ? (
              <Text fontSize={12} color="$placeholderColor">
                {group.description}
              </Text>
            ) : null}
          </YStack>
          <IconButton>
            <MoreHorizontal size={18} color={theme.color.get()} />
          </IconButton>
        </XStack>
        <XStack gap="$2">
          <Badge>
            <Text fontSize={12} color="$accentText">
              {connectionCount} hosts
            </Text>
          </Badge>
        </XStack>
      </Card>
    </Pressable>
  )
}
