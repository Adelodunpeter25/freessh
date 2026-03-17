import { Spinner, Text, YStack, useTheme } from 'tamagui'

type LoadingStateProps = {
  label?: string
}

export function LoadingState({ label = 'Loading...' }: LoadingStateProps) {
  const theme = useTheme()
  return (
    <YStack ai="center" jc="center" gap="$3" py="$6">
      <Spinner size="large" color="$accent" />
      <Text color={theme.placeholderColor.get()}>{label}</Text>
    </YStack>
  )
}
