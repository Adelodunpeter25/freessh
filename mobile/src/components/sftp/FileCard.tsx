import { FileText } from 'lucide-react-native'
import { Pressable } from 'react-native'
import { Text, XStack, YStack, useTheme } from 'tamagui'
import type { FileInfo } from '@/types'
import { formatFileSize, formatMode, formatModifiedTime } from '@/utils/sftp'

type FileCardProps = {
  file: FileInfo
  onPress?: () => void
}

export function FileCard({ file, onPress }: FileCardProps) {
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
          <FileText size={18} color={theme.color.get()} />
          <YStack flex={1}>
            <Text color="$color" fontSize={14} fontWeight="600" numberOfLines={1}>
              {file.name}
            </Text>
            <Text color="$placeholderColor" opacity={0.7} fontSize={10} numberOfLines={1}>
              {formatMode(file.mode)}
            </Text>
          </YStack>
        </XStack>
        <YStack alignItems="flex-end" minWidth={90}>
          <Text color="$placeholderColor" opacity={0.7} fontSize={10} numberOfLines={1}>
            {formatModifiedTime(file.mod_time)}
          </Text>
          <Text color="$placeholderColor" opacity={0.8} fontSize={10}>
            {formatFileSize(file.size)}
          </Text>
        </YStack>
      </XStack>
    </Pressable>
  )
}
