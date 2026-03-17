import { Copy, FolderOpen, Loader2, Pencil, Plug, Server, Trash2 } from 'lucide-react-native'
import { Pressable } from 'react-native'
import { useTheme, View } from 'tamagui'
import { BaseCard, ContextMenu } from '../common'
import type { ConnectionConfig } from '../../types'

type ConnectionCardProps = {
  connection: ConnectionConfig
  selected?: boolean
  loading?: boolean
  onPress?: () => void
  onEdit?: () => void
  onDelete?: () => void
  onOpenSftp?: () => void
  onDuplicate?: () => void
  onConnect?: () => void
}

export function ConnectionCard({ 
  connection, 
  selected = false, 
  loading = false, 
  onPress, 
  onEdit,
  onDelete,
  onOpenSftp,
  onDuplicate,
  onConnect,
}: ConnectionCardProps) {
  const theme = useTheme()

  return (
    <ContextMenu
      title={connection.name}
      onPress={onPress}
      items={[
        {
          key: 'connect',
          label: 'Connect',
          onPress: () => onConnect?.(),
          icon: <Plug size={16} color={theme.color.get()} />,
        },
        {
          key: 'open-sftp',
          label: 'Open in SFTP',
          onPress: () => onOpenSftp?.(),
          icon: <FolderOpen size={16} color={theme.color.get()} />,
        },
        {
          key: 'duplicate',
          label: 'Duplicate',
          onPress: () => onDuplicate?.(),
          icon: <Copy size={16} color={theme.color.get()} />,
        },
        { type: 'separator', key: 'sep-1' },
        {
          key: 'edit',
          label: 'Edit',
          onPress: () => onEdit?.(),
          icon: <Pencil size={16} color={theme.color.get()} />,
        },
        {
          key: 'delete',
          label: 'Delete',
          destructive: true,
          onPress: () => onDelete?.(),
          icon: <Trash2 size={16} color="#ef4444" />,
        },
      ]}
    >
      <BaseCard
        title={connection.name}
        subtitle={loading ? 'Connecting...' : `${connection.username}@${connection.host}`}
        icon={loading ? <Loader2 size={20} color={theme.color.get()} /> : <Server size={20} color={theme.color.get()} />}
        selected={selected}
        loading={loading}
        pressable={false}
        action={onEdit && !loading && (
          <Pressable onPress={(e) => {
            e.stopPropagation()
            onEdit()
          }}>
            <View
              width={32}
              height={32}
              alignItems="center"
              justifyContent="center"
              borderRadius="$2"
              backgroundColor="transparent"
            >
              <Pencil size={16} color={theme.color.get()} />
            </View>
          </Pressable>
        )}
      />
    </ContextMenu>
  )
}
