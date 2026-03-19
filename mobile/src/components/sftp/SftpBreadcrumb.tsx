import { ChevronRight, MoreVertical, Search, Upload } from 'lucide-react-native'
import { Text, XStack, useTheme } from 'tamagui'
import { IconButton } from '@/components/common'

type SftpBreadcrumbProps = {
  rootLabel: string
  lastLabel: string
  onUpload: () => void
  onSearch: () => void
  onMore: () => void
}

export function SftpBreadcrumb({
  rootLabel,
  lastLabel,
  onUpload,
  onSearch,
  onMore,
}: SftpBreadcrumbProps) {
  const theme = useTheme()

  return (
    <XStack
      ai="center"
      jc="space-between"
      gap="$2"
      px="$3"
      py="$2"
      bg="$background"
      borderBottomWidth={1}
      borderBottomColor="$borderColor"
    >
      <XStack ai="center" gap="$2" flex={1}>
        <Text color="$placeholderColor" fontSize={12} numberOfLines={1}>
          {rootLabel}
        </Text>
        <ChevronRight size={14} color={theme.iconMuted.get()} />
        <Text color="$color" fontSize={12} fontWeight="600" numberOfLines={1}>
          {lastLabel}
        </Text>
      </XStack>
      <XStack gap="$1">
        <IconButton onPress={onUpload}>
          <Upload size={14} color={theme.color.get()} />
        </IconButton>
        <IconButton onPress={onSearch}>
          <Search size={14} color={theme.color.get()} />
        </IconButton>
        <IconButton onPress={onMore}>
          <MoreVertical size={14} color={theme.color.get()} />
        </IconButton>
      </XStack>
    </XStack>
  )
}
