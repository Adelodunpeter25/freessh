import { Loader2, Pencil, Server } from 'lucide-react-native'
import { Pressable } from 'react-native'
import { useTheme, View } from 'tamagui'
import { BaseCard } from '../common'
import type { ConnectionConfig } from '../../types'

type ConnectionCardProps = {
  connection: ConnectionConfig
  selected?: boolean
  loading?: boolean
  onPress?: () => void
  onEdit?: () => void
}

export function ConnectionCard({ 
  connection, 
  selected = false, 
  loading = false, 
  onPress, 
  onEdit 
}: ConnectionCardProps) {
  const theme = useTheme()

  return (
    <BaseCard
      title={connection.name}
      subtitle={loading ? 'Connecting...' : `${connection.username}@${connection.host}`}
      icon={loading ? <Loader2 size={20} color={theme.color.get()} /> : <Server size={20} color={theme.color.get()} />}
      selected={selected}
      loading={loading}
      onPress={onPress}
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
  )
}
