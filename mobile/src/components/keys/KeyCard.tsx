import { Key, Pencil, Trash2 } from 'lucide-react-native'
import { Pressable } from 'react-native'
import { useTheme, View } from 'tamagui'
import { BaseCard, ContextMenu } from '@/components/common'
import type { SSHKey } from '@/types'

type KeyCardProps = {
  sshKey: SSHKey
  onPress?: () => void
  onEdit?: () => void
  onDelete?: () => void
}

export function KeyCard({ 
  sshKey, 
  onPress, 
  onEdit,
  onDelete,
}: KeyCardProps) {
  const theme = useTheme()

  return (
    <ContextMenu
      title={sshKey.name}
      onPress={onPress}
      items={[
        {
          key: 'edit',
          label: 'Edit',
          onPress: () => onEdit?.(),
          icon: <Pencil size={16} color={theme.color.get()} />,
        },
        { type: 'separator', key: 'sep-1' },
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
        title={sshKey.name}
        subtitle={`${sshKey.algorithm}${sshKey.bits ? ` • ${sshKey.bits} bits` : ''}`}
        icon={<Key size={20} color={theme.color.get()} />}
        pressable={false}
        action={onEdit && (
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
              <Pencil size={18} color={theme.color.get()} />
            </View>
          </Pressable>
        )}
      />
    </ContextMenu>
  )
}
