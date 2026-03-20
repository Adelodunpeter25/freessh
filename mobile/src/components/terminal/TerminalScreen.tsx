import { View } from 'react-native'
import { YStack } from 'tamagui'

type TerminalScreenProps = {
  children: React.ReactNode
  keyboardOffset?: number
}

export function TerminalScreen({ children }: TerminalScreenProps) {
  return (
    <YStack f={1} bg="$background">
      <View style={{ flex: 1 }}>
        {children}
      </View>
    </YStack>
  )
}
