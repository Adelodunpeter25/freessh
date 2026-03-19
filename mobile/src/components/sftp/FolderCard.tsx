import { Folder } from 'lucide-react-native'
import { Pressable } from 'react-native'
import { Text, XStack, YStack, useTheme } from 'tamagui'
import type { FileInfo } from '@/types'

type FolderCardProps = {
  folder: FileInfo
  onPress?: () => void
}

export function FolderCard({ folder, onPress }: FolderCardProps) {
  const theme = useTheme()

  return (
    <Pressable onPress={onPress} style={{ width: '100%' }}>
      <XStack
        alignItems="center"
        justifyContent="space-between"
        minHeight={56}
        paddingVertical="$2"
        paddingHorizontal="$3"
        borderBottomWidth={1}
        borderBottomColor="$borderColor"
        backgroundColor="transparent"
      >
        <XStack alignItems="center" gap="$3" flex={1}>
          <Folder size={18} color={theme.color.get()} />
          <YStack flex={1}>
            <Text color="$color" fontSize={14} fontWeight="600" numberOfLines={1}>
              {folder.name}
            </Text>
            <Text color="$placeholderColor" opacity={0.7} fontSize={10} numberOfLines={1}>
              Folder
            </Text>
          </YStack>
        </XStack>
      </XStack>
    </Pressable>
  )
}
