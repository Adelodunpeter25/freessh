import { FileText } from 'lucide-react-native'
import { Pressable } from 'react-native'
import { Text, XStack, useTheme } from 'tamagui'
import { BaseCard } from '@/components/common'
import type { FileInfo } from '@/types'

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
  return date.toLocaleDateString()
}

export function FileCard({ file, onPress }: FileCardProps) {
  const theme = useTheme()

  return (
    <Pressable onPress={onPress}>
      <BaseCard
        title={file.name}
        subtitle={
          <XStack gap="$2" ai="center">
            <Text fontSize={12} color="$placeholderColor">
              {formatSize(file.size)}
            </Text>
            <Text fontSize={12} color="$placeholderColor" opacity={0.6}>
              •
            </Text>
            <Text fontSize={12} color="$placeholderColor">
              {formatModified(file.mod_time)}
            </Text>
          </XStack>
        }
        icon={<FileText size={18} color={theme.placeholderColor.get()} />}
        pressable={false}
      />
    </Pressable>
  )
}
