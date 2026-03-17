import { Loader2, Pencil, Server } from 'lucide-react-native'
import { Pressable } from 'react-native'
import { Text, XStack, YStack, useTheme, View } from 'tamagui'

import type { ConnectionConfig } from '../../types'

type ConnectionCardProps = {
  connection: ConnectionConfig
  selected?: boolean
  loading?: boolean
  onPress?: () => void
  onEdit?: () => void
}

export function ConnectionCard({ 
  connection, 
  selected = false, 
  loading = false, 
  onPress, 
  onEdit 
}: ConnectionCardProps) {
  const theme = useTheme()

  return (
    <Pressable onPress={onPress}>
      <View
        backgroundColor="$background"
        borderColor={selected ? '$accent' : '$borderColor'}
        borderWidth={selected ? 2 : 0.5}
        borderRadius="$4"
        padding="$4"
        shadowColor="$shadowColor"
        shadowOffset={{ width: 0, height: selected ? 2 : 1 }}
        shadowOpacity={selected ? 0.1 : 0.05}
        shadowRadius={selected ? 8 : 4}
        elevation={selected ? 4 : 2}
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
            {loading ? (
              <Loader2 size={20} color={theme.color.get()} />
            ) : (
              <Server size={20} color={theme.color.get()} />
            )}
          </View>

          {/* Content */}
          <YStack flex={1}>
            <Text fontSize={16} fontWeight="600" color="$color">
              {connection.name}
            </Text>
            <Text fontSize={12} color="$placeholderColor">
              {loading ? 'Connecting...' : `${connection.username}@${connection.host}`}
            </Text>
          </YStack>

          {/* Actions */}
          {!loading && (
            <Pressable onPress={onEdit}>
              <View
                width={32}
                height={32}
                alignItems="center"
                justifyContent="center"
                borderRadius="$2"
                backgroundColor="transparent"
              >
                <Pencil size={16} color={theme.color.get()} />
              </View>
            </Pressable>
          )}
        </XStack>
      </View>
    </Pressable>
  )
}
