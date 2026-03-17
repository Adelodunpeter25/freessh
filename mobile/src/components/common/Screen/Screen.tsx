import { ScrollView } from 'react-native'
import { YStack } from 'tamagui'

type ScreenProps = {
  children: React.ReactNode
  padding?: number
}

export function Screen({ children, padding = 16 }: ScreenProps) {
  return (
    <YStack f={1} bg="$background">
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding, flexGrow: 1 }}
      >
        {children}
      </ScrollView>
    </YStack>
  )
}
