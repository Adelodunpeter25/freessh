import { Text, XStack, styled } from 'tamagui'

export const ListItem = styled(XStack, {
  name: 'AppListItem',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingVertical: 12,
  paddingHorizontal: 14,
  borderRadius: 12,
  borderWidth: 1,
  borderColor: '$borderColor',
  backgroundColor: '$background',
})

export const ListItemTitle = styled(Text, {
  name: 'AppListItemTitle',
  fontSize: 14,
  fontWeight: '600',
  color: '$color',
})

export const ListItemSubtitle = styled(Text, {
  name: 'AppListItemSubtitle',
  fontSize: 12,
  color: '$placeholderColor',
})
