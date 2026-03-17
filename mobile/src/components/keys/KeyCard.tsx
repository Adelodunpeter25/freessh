import { Key, Pencil } from 'lucide-react-native'
import { Pressable } from 'react-native'
import { useTheme, View } from 'tamagui'
import { BaseCard, ContextMenu } from '@/components/common'
import type { SSHKey } from '@/types'
import { useContextMenuActions } from '@/hooks'

type KeyCardProps = {
  sshKey: SSHKey
  onPress?: () => void
  onEdit?: () => void
}

export function KeyCard({ 
  sshKey, 
  onPress, 
  onEdit 
}: KeyCardProps) {
  const theme = useTheme()
  const actions = useContextMenuActions()

  return (
    <ContextMenu
      title={sshKey.name}
      onPress={onPress}
      items={[
        {
          key: 'edit',
          label: 'Edit',
          onPress: () => actions.editKey(sshKey),
        },
        { type: 'separator', key: 'sep-1' },
        {
          key: 'delete',
          label: 'Delete',
          destructive: true,
          onPress: () => actions.deleteKey(sshKey),
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
