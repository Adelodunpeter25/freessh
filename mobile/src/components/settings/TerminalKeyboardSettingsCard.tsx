import { Text, Switch, XStack, YStack } from 'tamagui'

import { Button, Card, Select } from '@/components/common'
import { useTerminalKeyboardStore } from '@/stores'

const keySizeOptions = [
  { label: 'Small', value: 'small' },
  { label: 'Medium', value: 'medium' },
  { label: 'Large', value: 'large' },
]

export function TerminalKeyboardSettingsCard() {
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

      <Button variant="outline" onPress={resetTopBar}>
        Reset Top Bar
      </Button>
    </Card>
  )
}
