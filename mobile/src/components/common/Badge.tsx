import { XStack, Text, styled } from 'tamagui'

export const Badge = styled(XStack, {
  name: 'AppBadge',
  borderRadius: 999,
  paddingHorizontal: 10,
  paddingVertical: 4,
  backgroundColor: '$accent',
  alignItems: 'center',
})

export const BadgeText = styled(Text, {
  name: 'AppBadgeText',
  fontSize: 12,
  fontWeight: '600',
  color: '$accentText',
})
