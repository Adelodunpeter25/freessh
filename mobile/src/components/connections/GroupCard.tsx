import { Folder, Pencil } from 'lucide-react-native'
import { Pressable } from 'react-native'
import { Text, XStack, YStack, useTheme, View } from 'tamagui'

import type { Group } from '../../types'

type GroupCardProps = {
  group: Group
  selected?: boolean
  onPress?: () => void
  onEdit?: () => void
}

export function GroupCard({ 
  group, 
  selected = false, 
  onPress, 
  onEdit 
}: GroupCardProps) {
  const theme = useTheme()
  const connectionSummary =
    group.connection_count === 0
      ? 'No connections'
      : `${group.connection_count} ${group.connection_count === 1 ? 'connection' : 'connections'}`

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
            <Folder size={20} color={theme.color.get()} />
          </View>

          {/* Content */}
          <YStack flex={1}>
            <Text fontSize={16} fontWeight="600" color="$color">
              {group.name}
            </Text>
            <Text fontSize={12} color="$placeholderColor">
              {connectionSummary}
            </Text>
          </YStack>

          {/* Actions */}
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
        </XStack>
      </View>
    </Pressable>
  )
}
