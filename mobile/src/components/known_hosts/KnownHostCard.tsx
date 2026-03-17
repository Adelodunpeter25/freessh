import { ShieldCheck, Trash2 } from 'lucide-react-native'
import { Pressable } from 'react-native'
import { useState } from 'react'
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
  const [menuOpen, setMenuOpen] = useState(false)
  const actions = useContextMenuActions()

  return (
    <>
      <BaseCard
        title={host.hostname}
        subtitle={host.fingerprint}
        icon={<ShieldCheck size={20} color={theme.color.get()} />}
        onLongPress={() => setMenuOpen(true)}
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

      <ContextMenu
        open={menuOpen}
        onOpenChange={setMenuOpen}
        title={host.hostname}
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
      />
    </>
  )
}
