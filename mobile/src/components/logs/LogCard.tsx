import { FileText, Trash2 } from 'lucide-react-native'
import { Pressable } from 'react-native'
import { Text, XStack, View, useTheme } from 'tamagui'
import { BaseCard } from '../common'
import type { LogEntry } from '@/types'

type LogCardProps = {
  log: LogEntry
  onPress?: () => void
  onDelete?: () => void
}

export function LogCard({ log, onPress, onDelete }: LogCardProps) {
  const theme = useTheme()

  const formatDate = (isoString: string) => {
    const date = new Date(isoString)
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <BaseCard
      title={log.connection_name}
      subtitle={
        <XStack gap="$2" ai="center">
          <Text fontSize={12} color="$placeholderColor">
            {formatDate(log.timestamp)}
          </Text>
          <Text fontSize={12} color="$placeholderColor" opacity={0.5}>•</Text>
          <Text fontSize={12} color="$placeholderColor">
            {formatSize(log.size)}
          </Text>
        </XStack>
      }
      icon={<FileText size={20} color={theme.color.get()} />}
      onPress={onPress}
      action={onDelete && (
        <Pressable onPress={(e) => {
          e.stopPropagation()
          onDelete()
        }}>
          <View
            width={32}
            height={32}
            alignItems="center"
            justifyContent="center"
            borderRadius="$2"
            backgroundColor="$destructive"
          >
            <Trash2 size={16} color={theme.iconWhite.get()} />
          </View>
        </Pressable>
      )}
    />
  )
}
