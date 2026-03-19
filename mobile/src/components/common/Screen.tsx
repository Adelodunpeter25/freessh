import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native'
import { YStack } from 'tamagui'
import { useThemeStore } from '@/stores'

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
  const theme = useThemeStore((state) => state.theme)
  const screenBackground = theme === 'dark' ? '#141a22' : '#f7fafd'

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
      <YStack f={1} backgroundColor={screenBackground}>
        {content}
      </YStack>
    )
  }

  return (
    <YStack f={1} backgroundColor={screenBackground}>
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
