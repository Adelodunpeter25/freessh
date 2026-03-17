import { FileText, Trash2 } from 'lucide-react-native'
import { Pressable } from 'react-native'
import { Text, XStack, YStack, useTheme, View } from 'tamagui'
import type { LogEntry } from '@/types'
import { Card } from '../common'

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
    <Pressable onPress={onPress}>
      <Card
        padding="$4"
        pressStyle={{ opacity: 0.8 }}
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
            <FileText size={20} color={theme.color.get()} />
          </View>

          <YStack flex={1}>
            <Text fontSize={16} fontWeight="600" color="$color">
              {log.connection_name}
            </Text>
            <XStack gap="$2" ai="center">
               <Text fontSize={12} color="$placeholderColor">
                 {formatDate(log.timestamp)}
               </Text>
               <Text fontSize={12} color="$placeholderColor" opacity={0.5}>•</Text>
               <Text fontSize={12} color="$placeholderColor">
                 {formatSize(log.size)}
               </Text>
            </XStack>
          </YStack>

          {onDelete && (
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
              >
                <Trash2 size={16} color="$red10" />
              </View>
            </Pressable>
          )}
        </XStack>
      </Card>
    </Pressable>
  )
}
