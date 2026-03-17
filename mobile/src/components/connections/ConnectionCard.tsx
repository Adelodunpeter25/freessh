import { MoreHorizontal } from 'lucide-react-native'
import { Text, XStack, YStack } from 'tamagui'

import { Badge, Card, IconButton } from '../common'
import type { Connection } from '../../types'

type ConnectionCardProps = {
  connection: Connection
  onPress?: () => void
}

export function ConnectionCard({ connection }: ConnectionCardProps) {
  return (
    <Card gap="$3">
      <XStack justifyContent="space-between" alignItems="center">
        <YStack>
          <Text fontSize={16} fontWeight="700">
            {connection.name}
          </Text>
          <Text fontSize={12} color="$placeholderColor">
            {connection.username}@{connection.host}:{connection.port}
          </Text>
        </YStack>
        <IconButton>
          <MoreHorizontal size={18} />
        </IconButton>
      </XStack>
      <XStack gap="$2">
        <Badge>
          <Text fontSize={12} color="$accentText">
            SSH
          </Text>
        </Badge>
      </XStack>
    </Card>
  )
}
