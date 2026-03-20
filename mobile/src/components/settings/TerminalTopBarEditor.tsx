import { Pressable } from 'react-native'
import { ArrowDown, ArrowUp, Eye, EyeOff, RotateCcw } from 'lucide-react-native'
import { Separator, Text, XStack, YStack, useTheme } from 'tamagui'

import { Button, Card } from '@/components/common'
import { terminalKeyboardPresets, type TerminalKeyboardKey } from '@/services/terminal'
import { useTerminalKeyboardStore } from '@/stores'

const buildTopBarCatalog = (currentKeys: TerminalKeyboardKey[]) => {
  const catalog = new Map<string, TerminalKeyboardKey>()

  terminalKeyboardPresets.forEach((preset) => {
    ;[...preset.topBar.pinnedKeys, ...preset.topBar.keys].forEach((key) => {
      if (!catalog.has(key.id)) {
        catalog.set(key.id, key)
      }
    })
  })

  currentKeys.forEach((key) => {
    if (!catalog.has(key.id)) {
      catalog.set(key.id, key)
    }
  })

  return Array.from(catalog.values())
}

export function TerminalTopBarEditor() {
  const theme = useTheme()
  const topBarKeys = useTerminalKeyboardStore((state) => state.config.topBar.keys)
  const reorderTopBarKeys = useTerminalKeyboardStore((state) => state.reorderTopBarKeys)
  const addTopBarKey = useTerminalKeyboardStore((state) => state.addTopBarKey)
  const removeTopBarKey = useTerminalKeyboardStore((state) => state.removeTopBarKey)
  const resetTopBar = useTerminalKeyboardStore((state) => state.resetTopBar)

  const catalog = buildTopBarCatalog(topBarKeys)

  const moveKey = (keyId: string, direction: 'up' | 'down') => {
    const index = topBarKeys.findIndex((key) => key.id === keyId)
    if (index < 0) {
      return
    }

    const nextIndex = direction === 'up' ? index - 1 : index + 1
    if (nextIndex < 0 || nextIndex >= topBarKeys.length) {
      return
    }

    const nextKeys = [...topBarKeys]
    const [currentKey] = nextKeys.splice(index, 1)
    nextKeys.splice(nextIndex, 0, currentKey)
    reorderTopBarKeys(nextKeys)
  }

  const toggleKey = (key: TerminalKeyboardKey) => {
    const isVisible = topBarKeys.some((item) => item.id === key.id)
    if (isVisible) {
      removeTopBarKey(key.id)
      return
    }

    addTopBarKey(key)
  }

  return (
    <Card gap="$4">
      <YStack gap="$1.5">
        <Text fontSize="$4" fontWeight="700">
          Top Bar Editor
        </Text>
        <Text color="$placeholderColor" fontSize="$2">
          Toggle top bar keys on or off and reorder the visible ones.
        </Text>
      </YStack>

      <YStack borderWidth={1} borderColor="$borderColor" borderRadius="$4" overflow="hidden">
        {catalog.map((key, index) => {
          const visibleIndex = topBarKeys.findIndex((item) => item.id === key.id)
          const isVisible = visibleIndex >= 0

          return (
            <YStack key={key.id}>
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
                    {key.label}
                  </Text>
                  <Text fontSize="$2" color="$placeholderColor">
                    {isVisible ? `Visible • Position ${visibleIndex + 1}` : 'Hidden'}
                  </Text>
                </YStack>

                <XStack gap="$1.5" alignItems="center">
                  <Pressable onPress={() => toggleKey(key)}>
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
                    disabled={!isVisible || visibleIndex === 0}
                    onPress={() => moveKey(key.id, 'up')}
                  >
                    <XStack
                      width={34}
                      height={34}
                      borderRadius={10}
                      borderWidth={1}
                      opacity={!isVisible || visibleIndex === 0 ? 0.45 : 1}
                      borderColor="$borderColor"
                      backgroundColor="$backgroundStrong"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <ArrowUp size={16} color={theme.color.get()} />
                    </XStack>
                  </Pressable>

                  <Pressable
                    disabled={!isVisible || visibleIndex === topBarKeys.length - 1}
                    onPress={() => moveKey(key.id, 'down')}
                  >
                    <XStack
                      width={34}
                      height={34}
                      borderRadius={10}
                      borderWidth={1}
                      opacity={!isVisible || visibleIndex === topBarKeys.length - 1 ? 0.45 : 1}
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

              {index < catalog.length - 1 ? <Separator borderColor="$borderColor" /> : null}
            </YStack>
          )
        })}
      </YStack>

      <Button variant="outline" onPress={resetTopBar}>
        <XStack gap="$2" alignItems="center">
          <RotateCcw size={16} />
          <Text>Reset Top Bar</Text>
        </XStack>
      </Button>
    </Card>
  )
}
