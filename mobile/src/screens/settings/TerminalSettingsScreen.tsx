import { useEffect, useState } from 'react'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { InteractionManager } from 'react-native'
import { Text, YStack } from 'tamagui'

import { AppHeader } from '@/components/common/AppHeader'
import { Screen } from '@/components/common/Screen'
import { SectionHeader } from '@/components/common/SectionHeader'
import { TerminalKeyboardSettingsCard } from '@/components/settings/TerminalKeyboardSettingsCard'
import { TerminalPresetPicker } from '@/components/settings/TerminalPresetPicker'
import { TerminalRowEditor } from '@/components/settings/TerminalRowEditor'
import type { ConnectionsStackParamList } from '@/navigation/AppNavigator'
import { useTerminalKeyboardStore } from '@/stores/terminalKeyboardStore'

export function TerminalSettingsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ConnectionsStackParamList>>()
  const config = useTerminalKeyboardStore((state) => state.config)
  const [contentReady, setContentReady] = useState(false)

  const visibleRows = config.fullKeyboard.rows.filter((row) => row.visible !== false).length

  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => {
      setContentReady(true)
    })

    return () => {
      task.cancel()
    }
  }, [])

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

          {contentReady ? (
            <>
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
            </>
          ) : null}
        </YStack>
      </Screen>
    </YStack>
  )
}
