import { Pressable } from 'react-native'
import { ArrowDown, ArrowUp, Eye, EyeOff, RotateCcw } from 'lucide-react-native'
import { Separator, Text, XStack, YStack, useTheme } from 'tamagui'

import { Button, Card } from '@/components/common'
import { useTerminalKeyboardStore } from '@/stores/terminalKeyboardStore'

export function TerminalRowEditor() {
  const theme = useTheme()
  const rows = useTerminalKeyboardStore((state) => state.config.fullKeyboard.rows)
  const reorderRows = useTerminalKeyboardStore((state) => state.reorderRows)
  const toggleRowVisibility = useTerminalKeyboardStore((state) => state.toggleRowVisibility)
  const resetFullKeyboard = useTerminalKeyboardStore((state) => state.resetFullKeyboard)

  const moveRow = (rowId: string, direction: 'up' | 'down') => {
    const index = rows.findIndex((row) => row.id === rowId)
    if (index < 0) {
      return
    }

    const nextIndex = direction === 'up' ? index - 1 : index + 1
    if (nextIndex < 0 || nextIndex >= rows.length) {
      return
    }

    const nextRows = [...rows]
    const [currentRow] = nextRows.splice(index, 1)
    nextRows.splice(nextIndex, 0, currentRow)
    reorderRows(nextRows)
  }

  return (
    <Card gap="$4">
      <YStack gap="$1.5">
        <Text fontSize="$4" fontWeight="700">
          Row Editor
        </Text>
        <Text color="$placeholderColor" fontSize="$2">
          Reorder rows and hide the ones you do not want in the expanded terminal keyboard.
        </Text>
      </YStack>

      <YStack borderWidth={1} borderColor="$borderColor" borderRadius="$4" overflow="hidden">
        {rows.map((row, index) => {
          const isVisible = row.visible !== false

          return (
            <YStack key={row.id}>
              <XStack
                alignItems="center"
                gap="$3"
                justifyContent="space-between"
                paddingHorizontal="$3"
                paddingVertical="$3"
                backgroundColor="$background"
              >
                <YStack flex={1} gap="$1">
                  <Text fontSize="$3" fontWeight="600">
                    {row.label ?? row.id}
                  </Text>
                  <Text fontSize="$2" color="$placeholderColor">
                    {row.keys.length} keys • {isVisible ? 'Visible' : 'Hidden'}
                  </Text>
                </YStack>

                <XStack gap="$1.5" alignItems="center">
                  <Pressable onPress={() => toggleRowVisibility(row.id)}>
                    <XStack
                      width={34}
                      height={34}
                      borderRadius={10}
                      borderWidth={1}
                      borderColor={isVisible ? '$accent' : '$borderColor'}
                      backgroundColor={isVisible ? '$backgroundPress' : '$backgroundStrong'}
                      alignItems="center"
                      justifyContent="center"
                    >
                      {isVisible ? (
                        <Eye size={16} color={theme.accent.get()} />
                      ) : (
                        <EyeOff size={16} color={theme.colorMuted.get()} />
                      )}
                    </XStack>
                  </Pressable>

                  <Pressable
                    disabled={index === 0}
                    onPress={() => moveRow(row.id, 'up')}
                  >
                    <XStack
                      width={34}
                      height={34}
                      borderRadius={10}
                      borderWidth={1}
                      opacity={index === 0 ? 0.45 : 1}
                      borderColor="$borderColor"
                      backgroundColor="$backgroundStrong"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <ArrowUp size={16} color={theme.color.get()} />
                    </XStack>
                  </Pressable>

                  <Pressable
                    disabled={index === rows.length - 1}
                    onPress={() => moveRow(row.id, 'down')}
                  >
                    <XStack
                      width={34}
                      height={34}
                      borderRadius={10}
                      borderWidth={1}
                      opacity={index === rows.length - 1 ? 0.45 : 1}
                      borderColor="$borderColor"
                      backgroundColor="$backgroundStrong"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <ArrowDown size={16} color={theme.color.get()} />
                    </XStack>
                  </Pressable>
                </XStack>
              </XStack>

              {index < rows.length - 1 ? <Separator borderColor="$borderColor" /> : null}
            </YStack>
          )
        })}
      </YStack>

      <Button
        variant="outline"
        onPress={resetFullKeyboard}
      >
        <XStack gap="$2" alignItems="center">
          <RotateCcw size={16} />
          <Text>Reset Rows</Text>
        </XStack>
      </Button>
    </Card>
  )
}
