import { Key, Pencil } from 'lucide-react-native'
import { Pressable } from 'react-native'
import { useState } from 'react'
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
  const [menuOpen, setMenuOpen] = useState(false)
  const actions = useContextMenuActions()

  return (
    <>
      <BaseCard
        title={sshKey.name}
        subtitle={`${sshKey.algorithm}${sshKey.bits ? ` • ${sshKey.bits} bits` : ''}`}
        icon={<Key size={20} color={theme.color.get()} />}
        onPress={onPress}
        onLongPress={() => setMenuOpen(true)}
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

      <ContextMenu
        open={menuOpen}
        onOpenChange={setMenuOpen}
        title={sshKey.name}
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
      />
    </>
  )
}
