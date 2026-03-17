import { Key, Pencil } from 'lucide-react-native'
import { Pressable } from 'react-native'
import { Text, XStack, YStack, useTheme, View } from 'tamagui'
import { Card } from '../common'

import type { SSHKey } from '@/types'

type KeyCardProps = {
  sshKey: SSHKey
  onPress?: () => void
  onEdit?: () => void
}

export function KeyCard({ 
  sshKey, 
  onPress, 
  onEdit 
}: KeyCardProps) {
  const theme = useTheme()

  return (
    <Pressable onPress={onPress}>
      <Card
        padding="$4"
        pressStyle={{ opacity: 0.8 }}
      >
        <XStack gap="$4" alignItems="center">
          {/* Icon Container */}
          <View
            width={44}
            height={44}
            borderRadius="$3"
            backgroundColor="$color"
            alignItems="center"
            justifyContent="center"
            opacity={0.1}
          >
            <Key size={20} color={theme.color.get()} />
          </View>

          {/* Content */}
          <YStack flex={1}>
            <Text fontSize={16} fontWeight="600" color="$color">
              {sshKey.name}
            </Text>
            <Text fontSize={12} color="$placeholderColor">
              {sshKey.algorithm} {sshKey.bits ? `• ${sshKey.bits} bits` : ''}
            </Text>
          </YStack>

          {/* Actions */}
          <Pressable onPress={(e) => {
            e.stopPropagation()
            onEdit?.()
          }}>
            <View
              width={32}
              height={32}
              alignItems="center"
              justifyContent="center"
              borderRadius="$2"
              backgroundColor="transparent"
            >
              <Pencil size={18} color={theme.color.get()} />
            </View>
          </Pressable>
        </XStack>
      </Card>
    </Pressable>
  )
}
