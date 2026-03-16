import { ScrollView } from 'react-native'
import { YStack } from 'tamagui'

import { EmptyState } from '../components'

export function SftpScreen() {
  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <YStack gap="$3">
        <EmptyState
          title="No SFTP connection"
          description="Connect to a host to browse files."
        />
      </YStack>
    </ScrollView>
  )
}
