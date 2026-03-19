import { useCallback, useState } from 'react'
import { Pressable } from 'react-native'
import { ChevronRight, Search, Upload, X } from 'lucide-react-native'
import { Button, Popover, Text, XStack, YStack, useTheme } from 'tamagui'
import { IconButton, Input } from '@/components/common'
import { MoreActions } from './MoreActions'

type SftpToolbarProps = {
  clickablePaths: Array<{ segment: string; path: string | null }>
  onNavigateTo: (path: string) => void
  query: string
  onQueryChange: (value: string) => void
  onClearQuery: () => void
  onUpload: () => void
  showHidden: boolean
  onToggleShowHidden: () => void
  hasSelection: boolean
  canSingleSelectAction: boolean
  onNewFolder: () => void
  onDelete: () => void
  onCopy: () => void
  onDownload: () => void
  onRename: () => void
}

export function SftpToolbar({
  clickablePaths,
  onNavigateTo,
  query,
  onQueryChange,
  onClearQuery,
  onUpload,
  showHidden,
  onToggleShowHidden,
  hasSelection,
  canSingleSelectAction,
  onNewFolder,
  onDelete,
  onCopy,
  onDownload,
  onRename,
}: SftpToolbarProps) {
  const theme = useTheme()
  const [searchOpen, setSearchOpen] = useState(false)
  const showSingleBreadcrumb = clickablePaths.length <= 1

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
        {showSingleBreadcrumb ? (
          <Text color="$placeholderColor" fontSize={12} numberOfLines={1}>
            {clickablePaths[0]?.segment ?? 'Home'}
          </Text>
        ) : (
          <XStack ai="center" gap={4}>
            {clickablePaths.map((item, index) => (
              <XStack key={index} ai="center" gap={4}>
                {item.path ? (
                  <Pressable onPress={() => onNavigateTo(item.path!)} hitSlop={8}>
                    <Text color="$iconSubtle" fontSize={12} fontWeight="500">
                      {item.segment}
                    </Text>
                  </Pressable>
                ) : (
                  <Text color="$color" fontSize={12} fontWeight="600">
                    {item.segment}
                  </Text>
                )}
                {index < clickablePaths.length - 1 && (
                  <ChevronRight size={12} color={theme.iconSubtle.get()} />
                )}
              </XStack>
            ))}
          </XStack>
        )}
      </XStack>

      {searchOpen ? (
        <XStack ai="center" gap="$1.5" width={210}>
          <Input
            flex={1}
            height={32}
            value={query}
            onChangeText={onQueryChange}
            placeholder="Search"
            autoFocus
            textAlignVertical="center"
            fontSize={12}
            py="$0"
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
          <MoreActions
            showHidden={showHidden}
            onToggleShowHidden={onToggleShowHidden}
            hasSelection={hasSelection}
            canSingleSelectAction={canSingleSelectAction}
            onNewFolder={onNewFolder}
            onDelete={onDelete}
            onCopy={onCopy}
            onDownload={onDownload}
            onRename={onRename}
          />
        </XStack>
      )}
    </XStack>
  )
}
