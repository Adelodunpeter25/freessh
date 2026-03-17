import { YStack } from 'tamagui'

import { EmptyState, Screen } from '@/components'

export function SftpScreen() {
  return (
    <Screen>
      <YStack gap="$3">
        <EmptyState
          title="No SFTP connection"
          description="Connect to a host to browse files."
        />
      </YStack>
    </Screen>
  )
}
