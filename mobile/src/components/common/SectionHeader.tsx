import { H4, XStack } from 'tamagui'

import { Divider } from './Divider'

type SectionHeaderProps = {
  title: string
}

export function SectionHeader({ title }: SectionHeaderProps) {
  return (
    <XStack alignItems="center" gap="$3">
      <H4>{title}</H4>
      <Divider flex={1} />
    </XStack>
  )
}
