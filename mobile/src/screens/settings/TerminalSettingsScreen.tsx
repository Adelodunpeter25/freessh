import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { Text, YStack } from 'tamagui'

import { AppHeader, Screen, SectionHeader } from '@/components'
import {
  TerminalKeyboardSettingsCard,
  TerminalPresetPicker,
  TerminalRowEditor,
} from '@/components/settings'
import type { ConnectionsStackParamList } from '@/navigation/AppNavigator'
import { useTerminalKeyboardStore } from '@/stores'

export function TerminalSettingsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ConnectionsStackParamList>>()
  const config = useTerminalKeyboardStore((state) => state.config)

  const visibleRows = config.fullKeyboard.rows.filter((row) => row.visible !== false).length

  return (
    <YStack flex={1} bg="$background">
      <AppHeader
        title="Terminal Keyboard"
        showBackButton
        onBackPress={() => navigation.goBack()}
      />
      <Screen>
        <YStack gap="$6">
          <YStack gap="$2">
            <Text fontSize="$8" fontWeight="700">
              Customize Terminal Keyboard
            </Text>
            <Text fontSize="$2" color="$placeholderColor">
              Current preset: {config.preset}. {visibleRows} of {config.fullKeyboard.rows.length} rows visible.
            </Text>
          </YStack>

          <YStack gap="$4">
            <SectionHeader title="Presets" />
            <TerminalPresetPicker />
          </YStack>

          <YStack gap="$4">
            <SectionHeader title="Rows" />
            <TerminalRowEditor />
          </YStack>

          <YStack gap="$4">
            <SectionHeader title="Options" />
            <TerminalKeyboardSettingsCard />
          </YStack>
        </YStack>
      </Screen>
    </YStack>
  )
}
