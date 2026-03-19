import { FileText } from 'lucide-react-native'
import { Pressable } from 'react-native'
import { Text, XStack, YStack, useTheme } from 'tamagui'
import type { FileInfo } from '@/types'
import { formatMode } from '@/utils/sftp'

type FileCardProps = {
  file: FileInfo
  onPress?: () => void
}

function formatSize(bytes: number): string {
  if (bytes <= 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  const value = bytes / 1024 ** index
  return `${value.toFixed(value >= 10 || index === 0 ? 0 : 1)} ${units[index]}`
}

function formatModified(timestamp: number): string {
  if (!timestamp) return 'Unknown date'
  const date = new Date(timestamp * 1000)
  const datePart = date.toLocaleDateString()
  const timePart = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  return `${datePart} ${timePart}`
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
            {formatModified(file.mod_time)}
          </Text>
          <Text color="$placeholderColor" opacity={0.8} fontSize={10}>
            {formatSize(file.size)}
          </Text>
        </YStack>
      </XStack>
    </Pressable>
  )
}
