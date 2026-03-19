import { Folder } from 'lucide-react-native'
import { Pressable } from 'react-native'
import { useTheme } from 'tamagui'
import { BaseCard } from '@/components/common'
import type { FileInfo } from '@/types'

type FolderCardProps = {
  folder: FileInfo
  onPress?: () => void
}

export function FolderCard({ folder, onPress }: FolderCardProps) {
  const theme = useTheme()

  return (
    <Pressable onPress={onPress}>
      <BaseCard
        title={folder.name}
        subtitle="Folder"
        icon={<Folder size={18} color={theme.accent.get()} />}
        pressable={false}
      />
    </Pressable>
  )
}
