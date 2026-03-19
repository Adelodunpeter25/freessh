import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native'
import { YStack } from 'tamagui'

type ScreenProps = {
  children: React.ReactNode
  padding?: number
  refreshControl?: React.ReactElement
  keyboardAvoiding?: boolean
  keyboardOffset?: number
}

export function Screen({
  children,
  padding = 16,
  refreshControl,
  keyboardAvoiding = false,
  keyboardOffset = 0,
}: ScreenProps) {
  const content = (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ padding, flexGrow: 1 }}
      refreshControl={refreshControl}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  )

  if (!keyboardAvoiding) {
    return (
      <YStack f={1} bg="$background">
        {content}
      </YStack>
    )
  }

  return (
    <YStack f={1} bg="$background">
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={keyboardOffset}
      >
        {content}
      </KeyboardAvoidingView>
    </YStack>
  )
}
