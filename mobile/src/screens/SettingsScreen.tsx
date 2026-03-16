import { ScrollView } from 'react-native'
import { Text, YStack } from 'tamagui'

import { Card, SectionHeader } from '../components'

export function SettingsScreen() {
  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <YStack gap="$4">
        <SectionHeader title="Preferences" />
        <Card gap="$2">
          <Text fontWeight="600">Theme</Text>
          <Text color="$placeholderColor" fontSize={12}>
            Light
          </Text>
        </Card>
      </YStack>
    </ScrollView>
  )
}
