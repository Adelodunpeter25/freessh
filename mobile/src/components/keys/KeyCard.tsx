import { Key, Pencil } from 'lucide-react-native'
import { Pressable } from 'react-native'
import { useTheme, View } from 'tamagui'
import { BaseCard } from '../common'
import type { SSHKey } from '@/types'

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

  return (
    <BaseCard
      title={sshKey.name}
      subtitle={`${sshKey.algorithm}${sshKey.bits ? ` • ${sshKey.bits} bits` : ''}`}
      icon={<Key size={20} color={theme.color.get()} />}
      onPress={onPress}
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
  )
}
