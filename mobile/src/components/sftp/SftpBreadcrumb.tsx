import { ChevronRight, MoreVertical, Search, Upload } from 'lucide-react-native'
import { Text, XStack } from 'tamagui'
import { IconButton } from '@/components'

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
  return (
    <XStack
      ai="center"
      jc="space-between"
      gap="$3"
      px="$3"
      py="$2.5"
      bg="$background"
      borderBottomWidth={1}
      borderBottomColor="$borderColor"
    >
      <XStack ai="center" gap="$2" flex={1}>
        <Text color="$placeholderColor" fontSize={13} numberOfLines={1}>
          {rootLabel}
        </Text>
        <ChevronRight size={14} color="#94a3b8" />
        <Text color="$color" fontSize={13} fontWeight="600" numberOfLines={1}>
          {lastLabel}
        </Text>
      </XStack>
      <XStack gap="$1.5">
        <IconButton onPress={onUpload}>
          <Upload size={16} />
        </IconButton>
        <IconButton onPress={onSearch}>
          <Search size={16} />
        </IconButton>
        <IconButton onPress={onMore}>
          <MoreVertical size={16} />
        </IconButton>
      </XStack>
    </XStack>
  )
}
