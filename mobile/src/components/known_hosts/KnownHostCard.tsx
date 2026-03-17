import { Pencil, ShieldCheck, Trash2 } from 'lucide-react-native'
import { Pressable } from 'react-native'
import { useTheme, View } from 'tamagui'
import { BaseCard, ContextMenu } from '../common'
import type { KnownHost } from '@/types'

type KnownHostCardProps = {
  host: KnownHost
  onDelete?: () => void
  onEdit?: () => void
}

export function KnownHostCard({ host, onDelete, onEdit }: KnownHostCardProps) {
  const theme = useTheme()

  return (
    <ContextMenu
      title={host.hostname}
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
        title={host.hostname}
        subtitle={host.fingerprint}
        icon={<ShieldCheck size={20} color={theme.color.get()} />}
        pressable={false}
        action={onDelete && (
          <Pressable onPress={(e) => {
            e.stopPropagation()
            onDelete()
          }}>
            <View
              width={32}
              height={32}
              alignItems="center"
              justifyContent="center"
              borderRadius="$2"
            >
              <Trash2 size={16} color="$red10" />
            </View>
          </Pressable>
        )}
      />
    </ContextMenu>
  )
}
