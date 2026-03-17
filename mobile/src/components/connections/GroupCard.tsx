import { Folder, Pencil } from 'lucide-react-native'
import { Pressable } from 'react-native'
import { useTheme, View } from 'tamagui'
import { BaseCard, ContextMenu } from '../common'
import type { Group } from '../../types'
import { useContextMenuActions } from '@/hooks'

type GroupCardProps = {
  group: Group
  selected?: boolean
  onPress?: () => void
  onEdit?: () => void
}

export function GroupCard({ 
  group, 
  selected = false, 
  onPress, 
  onEdit 
}: GroupCardProps) {
  const theme = useTheme()
  const actions = useContextMenuActions()
  const connectionSummary =
    group.connection_count === 0
      ? 'No connections'
      : `${group.connection_count} ${group.connection_count === 1 ? 'connection' : 'connections'}`

  return (
    <ContextMenu
      title={group.name}
      onPress={onPress}
      items={[
        {
          key: 'edit',
          label: 'Edit',
          onPress: () => actions.editGroup(group),
        },
        { type: 'separator', key: 'sep-1' },
        {
          key: 'delete',
          label: 'Delete',
          destructive: true,
          onPress: () => actions.deleteGroup(group),
        },
      ]}
    >
      <BaseCard
        title={group.name}
        subtitle={connectionSummary}
        icon={<Folder size={20} color={theme.color.get()} />}
        selected={selected}
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
