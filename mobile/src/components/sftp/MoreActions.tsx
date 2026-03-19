import type { ReactNode } from 'react'
import {
  Copy,
  Download,
  Eye,
  EyeOff,
  FolderPlus,
  MoreVertical,
  Pencil,
  Trash2,
} from 'lucide-react-native'
import { Menu, MenuOption, MenuOptions, MenuTrigger } from 'react-native-popup-menu'
import { Text, View, XStack, useTheme } from 'tamagui'

type MoreActionsProps = {
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

function MenuRow({
  icon,
  label,
  onPress,
  destructive = false,
}: {
  icon: ReactNode
  label: string
  onPress: () => void
  destructive?: boolean
}) {
  return (
    <MenuOption
      onSelect={onPress}
      customStyles={{
        optionWrapper: {
          paddingVertical: 8,
          paddingHorizontal: 10,
        },
      }}
    >
      <XStack alignItems="center" gap="$2">
        {icon}
        <Text color={destructive ? '$destructive' : '$color'} fontSize={13} fontWeight="600">
          {label}
        </Text>
      </XStack>
    </MenuOption>
  )
}

export function MoreActions({
  showHidden,
  onToggleShowHidden,
  hasSelection,
  canSingleSelectAction,
  onNewFolder,
  onDelete,
  onCopy,
  onDownload,
  onRename,
}: MoreActionsProps) {
  const theme = useTheme()

  return (
    <Menu>
      <MenuTrigger>
        <XStack
          width={32}
          height={32}
          borderRadius={999}
          alignItems="center"
          justifyContent="center"
        >
          <MoreVertical size={14} color={theme.color.get()} />
        </XStack>
      </MenuTrigger>
      <MenuOptions
        customStyles={{
          optionsContainer: {
            borderRadius: 10,
            paddingVertical: 4,
            backgroundColor: theme.background.get(),
            borderColor: theme.borderColor.get(),
            borderWidth: 1,
            minWidth: 170,
            marginRight: 6,
          },
        }}
      >
        <MenuRow
          icon={<FolderPlus size={14} color={theme.color.get()} />}
          label="New folder"
          onPress={onNewFolder}
        />
        {hasSelection ? (
          <>
            <MenuRow
              icon={<Trash2 size={14} color={theme.destructive.get()} />}
              label="Delete"
              onPress={onDelete}
              destructive
            />
            <View height={1} backgroundColor="$borderColor" opacity={0.8} marginHorizontal="$2" />
            <MenuRow
              icon={<Copy size={14} color={theme.color.get()} />}
              label="Copy"
              onPress={onCopy}
            />
            <MenuRow
              icon={<Download size={14} color={theme.color.get()} />}
              label="Download"
              onPress={onDownload}
            />
            {canSingleSelectAction ? (
              <MenuRow
                icon={<Pencil size={14} color={theme.color.get()} />}
                label="Rename"
                onPress={onRename}
              />
            ) : null}
          </>
        ) : null}
        <View height={1} backgroundColor="$borderColor" opacity={0.8} marginHorizontal="$2" />
        <MenuRow
          icon={showHidden ? (
            <EyeOff size={14} color={theme.color.get()} />
          ) : (
            <Eye size={14} color={theme.color.get()} />
          )}
          label={showHidden ? 'Hide hidden files' : 'Show hidden files'}
          onPress={onToggleShowHidden}
        />
      </MenuOptions>
    </Menu>
  )
}
