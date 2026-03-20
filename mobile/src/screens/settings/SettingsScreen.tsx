import { ChevronRight, Keyboard, Moon, Sun } from 'lucide-react-native'
import { Button, Switch, Text, XStack, YStack, useTheme } from 'tamagui'
import { Pressable } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'

import { Card } from '@/components/common/Card'
import { Screen } from '@/components/common/Screen'
import { SectionHeader } from '@/components/common/SectionHeader'
import { useThemeStore } from '@/stores/themeStore'
import type { ConnectionsStackParamList } from '@/navigation/AppNavigator'

export function SettingsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ConnectionsStackParamList>>()
  const { theme, followSystem, toggleTheme, setFollowSystem } = useThemeStore()
  const tamaguiTheme = useTheme()

  return (
    <Screen>
      <YStack gap="$6">
        <YStack gap="$4">
          <SectionHeader title="Appearance" />

          <Card p="$4" gap="$4">
            <XStack justifyContent="space-between" alignItems="center">
              <YStack flex={1} pr="$4">
                <Text fontWeight="600" fontSize="$4">
                  Appearance Mode
                </Text>
                <Text color="$placeholderColor" fontSize="$2" mt="$1">
                  Currently using {theme} mode.{' '}
                  {followSystem ? '(Following System)' : '(Manual)'}
                </Text>
              </YStack>
              <Button
                circular
                size="$4"
                onPress={toggleTheme}
                disabled={followSystem}
                opacity={followSystem ? 0.5 : 1}
                bg="$background"
                borderColor="$borderColor"
                borderWidth={1}
              >
                {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
              </Button>
            </XStack>

            <XStack justifyContent="space-between" alignItems="center">
              <YStack>
                <Text fontWeight="600" fontSize="$4">
                  Follow System
                </Text>
                <Text color="$placeholderColor" fontSize="$2" mt="$1">
                  Sync theme with your device settings
                </Text>
              </YStack>
              <Switch
                size="$3"
                checked={followSystem}
                onCheckedChange={setFollowSystem}
              >
                <Switch.Thumb />
              </Switch>
            </XStack>
          </Card>
        </YStack>

        <YStack gap="$4">
          <SectionHeader title="Terminal" />

          <Pressable onPress={() => navigation.navigate('TerminalSettings')}>
            <Card p="$4">
              <XStack alignItems="center" gap="$3">
                <XStack
                  width={40}
                  height={40}
                  borderRadius="$3"
                  backgroundColor="$backgroundPress"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Keyboard size={20} color={tamaguiTheme.accent.get()} />
                </XStack>

                <YStack flex={1}>
                  <Text fontWeight="600" fontSize="$4">
                    Terminal Keyboard
                  </Text>
                  <Text color="$placeholderColor" fontSize="$2" mt="$1">
                    Choose presets and edit expanded keyboard rows
                  </Text>
                </YStack>

                <ChevronRight size={18} color={tamaguiTheme.colorMuted.get()} />
              </XStack>
            </Card>
          </Pressable>
        </YStack>
      </YStack>
    </Screen>
  )
}
