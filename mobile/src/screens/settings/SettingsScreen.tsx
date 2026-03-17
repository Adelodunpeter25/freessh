import { Moon, Sun } from 'lucide-react-native'
import { Button, Switch, Text, XStack, YStack } from 'tamagui'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'

import { Card, Screen, SectionHeader } from '@/components'
import { useThemeStore } from '@/stores'
import type { ConnectionsStackParamList } from '@/navigation/AppNavigator'

export function SettingsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ConnectionsStackParamList>>()
  const { theme, followSystem, toggleTheme, setFollowSystem } = useThemeStore()

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
      </YStack>
    </Screen>
  )
}
