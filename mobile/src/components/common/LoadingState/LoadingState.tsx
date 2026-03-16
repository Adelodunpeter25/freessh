import { Spinner, Text, YStack } from 'tamagui'

type LoadingStateProps = {
  label?: string
}

export function LoadingState({ label = 'Loading...' }: LoadingStateProps) {
  return (
    <YStack ai="center" jc="center" gap="$3" py="$6">
      <Spinner size="large" color="$accent" />
      <Text color="$placeholderColor">{label}</Text>
    </YStack>
  )
}
