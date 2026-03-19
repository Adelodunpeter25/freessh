import { FileText } from 'lucide-react-native'
import { Pressable } from 'react-native'
import { Text, XStack, YStack } from 'tamagui'
import type { FileInfo } from '@/types'
import { formatFileSize, formatMode, formatModifiedTime } from '@/utils/sftp'

type FileCardProps = {
  file: FileInfo
  onPress?: () => void
}

export function FileCard({ file, onPress }: FileCardProps) {
  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: 'rgba(148, 163, 184, 0.14)' }}
      style={({ pressed }) => ({
        width: '100%',
        backgroundColor: pressed ? 'rgba(148, 163, 184, 0.08)' : 'transparent',
      })}
    >
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
          <XStack
            width={21}
            height={21}
            borderRadius={5}
            alignItems="center"
            justifyContent="center"
            backgroundColor="rgba(234, 88, 12, 0.18)"
          >
            <FileText size={13} color="#c2410c" fill="#c2410c" />
          </XStack>
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
