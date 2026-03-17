import { Plus } from 'lucide-react-native'
import { Pressable } from 'react-native'
import { View, useTheme } from 'tamagui'

type AddButtonProps = {
  onPress: () => void
}

export function AddButton({ onPress }: AddButtonProps) {
  const theme = useTheme()

  return (
    <View
      position="absolute"
      bottom={20}
      right={20}
      zIndex={1000}
      pointerEvents="box-none"
    >
      <Pressable onPress={onPress}>
        <View
          width={56}
          height={56}
          borderRadius="$6"
          backgroundColor="$accent"
          alignItems="center"
          justifyContent="center"
          shadowColor="$accent"
          shadowOffset={{ width: 0, height: 4 }}
          shadowOpacity={0.3}
          shadowRadius={8}
          elevation={8}
        >
          <Plus size={24} color="white" />
        </View>
      </Pressable>
    </View>
  )
}
