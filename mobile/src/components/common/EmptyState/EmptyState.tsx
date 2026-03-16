import { Circle, Text, XStack, YStack } from 'tamagui'

export type EmptyStateProps = {
  title: string
  description?: string
  icon?: React.ReactNode
}

export function EmptyState({ title, description, icon }: EmptyStateProps) {
  return (
    <YStack ai="center" jc="center" gap="$3" py="$6">
      <Circle size={64} bg="$borderColor">
        {icon ?? <Text fontSize={22}>•</Text>}
      </Circle>
      <YStack ai="center" gap="$2" px="$6">
        <Text fontSize={16} fontWeight="600">
          {title}
        </Text>
        {description ? (
          <Text fontSize={13} color="$placeholderColor" textAlign="center">
            {description}
          </Text>
        ) : null}
      </YStack>
    </YStack>
  )
}
