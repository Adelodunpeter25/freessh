import { useCallback, useState } from 'react'
import { Pressable } from 'react-native'
import { ChevronRight, Search, Upload, X } from 'lucide-react-native'
import { Text, XStack, useTheme } from 'tamagui'
import { IconButton, Input } from '@/components/common'
import { MoreActions } from './MoreActions'

type SftpToolbarProps = {
  rootLabel: string
  fullBreadcrumb: string
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
  onPressRoot: () => void
  onPressCurrent: () => void
}

export function SftpToolbar({
  rootLabel,
  fullBreadcrumb,
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
  onPressRoot,
  onPressCurrent,
}: SftpToolbarProps) {
  const theme = useTheme()
  const [searchOpen, setSearchOpen] = useState(false)
  const showSingleBreadcrumb = fullBreadcrumb === rootLabel

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
        <Pressable onPress={onPressRoot} hitSlop={8}>
          <Text color="$placeholderColor" fontSize={12} numberOfLines={1}>
            {rootLabel}
          </Text>
        </Pressable>
        {showSingleBreadcrumb ? null : (
          <>
            <ChevronRight size={14} color="#94a3b8" />
            <Pressable onPress={onPressCurrent} hitSlop={8}>
              <Text color="$color" fontSize={12} fontWeight="600" numberOfLines={1}>
                {fullBreadcrumb}
              </Text>
            </Pressable>
          </>
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
            lineHeight={16}
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
