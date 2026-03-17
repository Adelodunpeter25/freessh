import { ShieldCheck, Trash2 } from 'lucide-react-native'
import { Pressable } from 'react-native'
import { Text, XStack, YStack, useTheme, View } from 'tamagui'
import type { KnownHost } from '@/types'
import { Card } from '../common'

type KnownHostCardProps = {
  host: KnownHost
  onDelete?: () => void
}

export function KnownHostCard({ host, onDelete }: KnownHostCardProps) {
  const theme = useTheme()

  return (
    <Card
      padding="$4"
    >
      <XStack gap="$4" alignItems="center">
        <View
          width={44}
          height={44}
          borderRadius="$3"
          backgroundColor="$color"
          alignItems="center"
          justifyContent="center"
          opacity={0.1}
        >
          <ShieldCheck size={20} color={theme.color.get()} />
        </View>

        <YStack flex={1}>
          <Text fontSize={16} fontWeight="600" color="$color">
            {host.hostname}
          </Text>
          <Text fontSize={12} color="$placeholderColor" numberOfLines={1}>
            {host.fingerprint}
          </Text>
        </YStack>

        {onDelete && (
          <Pressable onPress={onDelete}>
            <View
              width={32}
              height={32}
              alignItems="center"
              justifyContent="center"
              borderRadius="$2"
            >
              <Trash2 size={16} color="$red10" />
            </View>
          </Pressable>
        )}
      </XStack>
    </Card>
  )
}
