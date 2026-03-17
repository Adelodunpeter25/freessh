import { KeyboardAvoidingView, Platform } from 'react-native'
import { YStack } from 'tamagui'

type TerminalScreenProps = {
  children: React.ReactNode
  keyboardOffset?: number
}

export function TerminalScreen({ children, keyboardOffset = 0 }: TerminalScreenProps) {
  return (
    <YStack f={1} bg="$background">
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={keyboardOffset}
      >
        {children}
      </KeyboardAvoidingView>
    </YStack>
  )
}
