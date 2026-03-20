import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { Text, YStack } from 'tamagui'

import { AppHeader } from '@/components/common/AppHeader'
import { Screen } from '@/components/common/Screen'
import { TerminalTopBarEditor } from '@/components/settings/TerminalTopBarEditor'
import type { ConnectionsStackParamList } from '@/navigation/AppNavigator'
import { useTerminalKeyboardStore } from '@/stores/terminalKeyboardStore'

export function TerminalTopBarSettingsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ConnectionsStackParamList>>()
  const topBarKeys = useTerminalKeyboardStore((state) => state.config.topBar.keys)

  return (
    <YStack flex={1} bg="$background">
      <AppHeader
        title="Top Bar Editor"
        showBackButton
        onBackPress={() => navigation.goBack()}
      />
      <Screen>
        <YStack gap="$6">
          <YStack gap="$2">
            <Text fontSize="$8" fontWeight="700">
              Customize Top Bar
            </Text>
            <Text fontSize="$2" color="$placeholderColor">
              {topBarKeys.length} keys currently visible in the terminal top bar.
            </Text>
          </YStack>

          <TerminalTopBarEditor />
        </YStack>
      </Screen>
    </YStack>
  )
}
