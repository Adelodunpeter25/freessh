import { ShieldCheck, Trash2 } from 'lucide-react-native'
import { Pressable } from 'react-native'
import { useTheme, View } from 'tamagui'
import { BaseCard, ContextMenu } from '../common'
import type { KnownHost } from '@/types'
import { useContextMenuActions } from '@/hooks'

type KnownHostCardProps = {
  host: KnownHost
  onDelete?: () => void
}

export function KnownHostCard({ host, onDelete }: KnownHostCardProps) {
  const theme = useTheme()
  const actions = useContextMenuActions()

  return (
    <ContextMenu
      title={host.hostname}
      onPress={() => {}}
      items={[
        {
          key: 'edit',
          label: 'Edit',
          onPress: () => actions.editKnownHost(host),
        },
        { type: 'separator', key: 'sep-1' },
        {
          key: 'delete',
          label: 'Delete',
          destructive: true,
          onPress: () => actions.deleteKnownHost(host),
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
