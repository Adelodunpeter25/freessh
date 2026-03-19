import { RotateCcw } from 'lucide-react-native'
import { Text, XStack, YStack } from 'tamagui'

import { Button, Card, Select } from '@/components/common'
import { terminalKeyboardPresets } from '@/services/terminal'
import { useTerminalKeyboardStore } from '@/stores'

const presetOptions = [
  ...terminalKeyboardPresets.map((preset) => ({
    label: preset.name,
    value: preset.id,
  })),
  {
    label: 'Custom',
    value: 'custom',
  },
]

export function TerminalPresetPicker() {
  const preset = useTerminalKeyboardStore((state) => state.config.preset)
  const setPreset = useTerminalKeyboardStore((state) => state.setPreset)
  const resetToDefault = useTerminalKeyboardStore((state) => state.resetToDefault)

  const selectedPreset =
    terminalKeyboardPresets.find((item) => item.id === preset) ?? null

  return (
    <Card gap="$4">
      <YStack gap="$1.5">
        <Text fontSize="$4" fontWeight="700">
          Keyboard Preset
        </Text>
        <Text color="$placeholderColor" fontSize="$2">
          Switch between preset layouts. Choosing another preset replaces the current row setup.
        </Text>
      </YStack>

      <Select
        label="Preset"
        value={preset}
        onValueChange={(value) => {
          if (value !== 'custom') {
            setPreset(value as (typeof terminalKeyboardPresets)[number]['id'])
          }
        }}
        options={presetOptions}
      />

      <YStack gap="$1.5">
        <Text fontSize="$3" fontWeight="600">
          {selectedPreset?.name ?? 'Custom Layout'}
        </Text>
        <Text color="$placeholderColor" fontSize="$2">
          {selectedPreset?.description ??
            'This layout has been customized from one of the presets.'}
        </Text>
      </YStack>

      <XStack gap="$2">
        <Button
          flex={1}
          variant="outline"
          onPress={resetToDefault}
        >
          <XStack gap="$2" alignItems="center">
            <RotateCcw size={16} />
            <Text>Reset to Default</Text>
          </XStack>
        </Button>
      </XStack>
    </Card>
  )
}
