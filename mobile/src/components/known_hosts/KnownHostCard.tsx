import { ShieldCheck, Trash2 } from 'lucide-react-native'
import { Pressable } from 'react-native'
import { View, useTheme } from 'tamagui'
import { BaseCard } from '../common'
import type { KnownHost } from '@/types'

type KnownHostCardProps = {
  host: KnownHost
  onDelete?: () => void
}

export function KnownHostCard({ host, onDelete }: KnownHostCardProps) {
  const theme = useTheme()

  return (
    <BaseCard
      title={host.hostname}
      subtitle={host.fingerprint}
      icon={<ShieldCheck size={20} color={theme.color.get()} />}
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
            backgroundColor="$destructive"
          >
            <Trash2 size={16} color={theme.iconWhite.get()} />
          </View>
        </Pressable>
      )}
    />
  )
}
