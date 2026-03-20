import { Pressable } from 'react-native'
import { ChevronRight } from 'lucide-react-native'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { Text, Switch, XStack, YStack, useTheme } from 'tamagui'

import { Button, Card, Select } from '@/components/common'
import { useTerminalKeyboardStore } from '@/stores/terminalKeyboardStore'
import type { ConnectionsStackParamList } from '@/navigation/AppNavigator'

const keySizeOptions = [
  { label: 'Small', value: 'small' },
  { label: 'Medium', value: 'medium' },
  { label: 'Large', value: 'large' },
]

export function TerminalKeyboardSettingsCard() {
  const navigation = useNavigation<NativeStackNavigationProp<ConnectionsStackParamList>>()
  const theme = useTheme()
  const settings = useTerminalKeyboardStore((state) => state.config.settings)
  const updateSettings = useTerminalKeyboardStore((state) => state.updateSettings)
  const resetTopBar = useTerminalKeyboardStore((state) => state.resetTopBar)

  return (
    <Card gap="$4">
      <YStack gap="$1.5">
        <Text fontSize="$4" fontWeight="700">
          Keyboard Options
        </Text>
        <Text color="$placeholderColor" fontSize="$2">
          Tune the terminal keyboard density and restore the top bar if needed.
        </Text>
      </YStack>

      <Select
        label="Key Size"
        value={settings.keySize}
        onValueChange={(value) =>
          updateSettings({ keySize: value as 'small' | 'medium' | 'large' })
        }
        options={keySizeOptions}
      />

      <XStack justifyContent="space-between" alignItems="center">
        <YStack flex={1} pr="$4">
          <Text fontSize="$3" fontWeight="600">
            Compact Mode
          </Text>
          <Text fontSize="$2" color="$placeholderColor">
            Tighten spacing between rows in the expanded keyboard.
          </Text>
        </YStack>
        <Switch
          size="$3"
          checked={settings.compactMode}
          onCheckedChange={(value) => updateSettings({ compactMode: value })}
        >
          <Switch.Thumb />
        </Switch>
      </XStack>

      <XStack justifyContent="space-between" alignItems="center">
        <YStack flex={1} pr="$4">
          <Text fontSize="$3" fontWeight="600">
            Show Hints
          </Text>
          <Text fontSize="$2" color="$placeholderColor">
            Keep helper hints available for future keyboard guidance surfaces.
          </Text>
        </YStack>
        <Switch
          size="$3"
          checked={settings.showHints}
          onCheckedChange={(value) => updateSettings({ showHints: value })}
        >
          <Switch.Thumb />
        </Switch>
      </XStack>

      <Pressable onPress={() => navigation.navigate('TerminalTopBarSettings')}>
        <XStack
          justifyContent="space-between"
          alignItems="center"
          borderWidth={1}
          borderColor="$borderColor"
          borderRadius="$4"
          backgroundColor="$background"
          paddingHorizontal="$3"
          paddingVertical="$3"
        >
          <YStack flex={1} pr="$4">
            <Text fontSize="$3" fontWeight="600">
              Top Bar Editor
            </Text>
            <Text fontSize="$2" color="$placeholderColor">
              Configure which keys show in the terminal top bar and reorder them.
            </Text>
          </YStack>
          <ChevronRight size={18} color={theme.colorMuted.get()} />
        </XStack>
      </Pressable>

      <Button variant="outline" onPress={resetTopBar}>
        Reset Top Bar
      </Button>
    </Card>
  )
}
