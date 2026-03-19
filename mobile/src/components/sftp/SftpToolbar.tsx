import { useCallback, useState } from 'react'
import { ChevronRight, MoreVertical, Search, Upload, X } from 'lucide-react-native'
import { Text, XStack, useTheme } from 'tamagui'
import { IconButton, Input } from '@/components'

type SftpToolbarProps = {
  rootLabel: string
  lastLabel: string
  query: string
  onQueryChange: (value: string) => void
  onClearQuery: () => void
  onUpload: () => void
  onMore: () => void
}

export function SftpToolbar({
  rootLabel,
  lastLabel,
  query,
  onQueryChange,
  onClearQuery,
  onUpload,
  onMore,
}: SftpToolbarProps) {
  const theme = useTheme()
  const [searchOpen, setSearchOpen] = useState(false)

  const openSearch = useCallback(() => {
    setSearchOpen(true)
  }, [])

  const closeSearch = useCallback(() => {
    setSearchOpen(false)
    onClearQuery()
  }, [onClearQuery])

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
        <ChevronRight size={14} color="#94a3b8" />
        <Text color="$color" fontSize={12} fontWeight="600" numberOfLines={1}>
          {lastLabel}
        </Text>
      </XStack>

      {searchOpen ? (
        <XStack ai="center" gap="$1.5" width={170}>
          <Input
            flex={1}
            height={34}
            value={query}
            onChangeText={onQueryChange}
            placeholder="Search"
            autoFocus
          />
          <IconButton onPress={closeSearch}>
            <X size={14} color={theme.color.get()} />
          </IconButton>
        </XStack>
      ) : (
        <XStack gap="$1">
          <IconButton onPress={onUpload}>
            <Upload size={14} color={theme.color.get()} />
          </IconButton>
          <IconButton onPress={openSearch}>
            <Search size={14} color={theme.color.get()} />
          </IconButton>
          <IconButton onPress={onMore}>
            <MoreVertical size={14} color={theme.color.get()} />
          </IconButton>
        </XStack>
      )}
    </XStack>
  )
}
