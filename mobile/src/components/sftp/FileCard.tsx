import { Check, FileText } from 'lucide-react-native'
import { Pressable } from 'react-native'
import { Text, XStack, YStack, useTheme } from 'tamagui'
import type { FileInfo } from '@/types'
import { formatFileSize, formatMode, formatModifiedTime } from '@/utils/sftp'

type FileCardProps = {
  file: FileInfo
  onPress?: () => void
  onLongPress?: () => void
  selected?: boolean
}

export function FileCard({ file, onPress, onLongPress, selected = false }: FileCardProps) {
  const theme = useTheme()

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      android_ripple={{ color: theme.ripple.get() }}
      style={({ pressed }) => ({
        width: '100%',
        backgroundColor: selected
          ? theme.selection.get()
          : pressed
            ? theme.backgroundHover.get()
            : 'transparent',
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
          {selected ? (
            <XStack
              width={21}
              height={21}
              borderRadius={5}
              alignItems="center"
              justifyContent="center"
              backgroundColor="$accentPress"
            >
              <Check size={18} color={theme.iconWhite.get()} />
            </XStack>
          ) : (
            <XStack
              width={21}
              height={21}
              borderRadius={5}
              alignItems="center"
              justifyContent="center"
              backgroundColor="$accentMuted"
            >
              <FileText size={13} color={theme.accentDeep.get()} fill={theme.accentDeep.get()} />
            </XStack>
          )}
          <YStack flex={1}>
            <Text color="$color" fontSize={15} fontWeight="600" numberOfLines={1}>
              {file.name}
            </Text>
            <Text color="$placeholderColor" opacity={0.85} fontSize={12} numberOfLines={1}>
              {formatMode(file.mode)}
            </Text>
          </YStack>
        </XStack>
        <YStack alignItems="flex-end" minWidth={90}>
          <Text color="$placeholderColor" opacity={0.85} fontSize={12} numberOfLines={1}>
            {formatModifiedTime(file.mod_time)}
          </Text>
          <Text color="$placeholderColor" opacity={0.9} fontSize={12} fontWeight="500">
            {formatFileSize(file.size)}
          </Text>
        </YStack>
      </XStack>
    </Pressable>
  )
}
