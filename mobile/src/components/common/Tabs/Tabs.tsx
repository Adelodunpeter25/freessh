import { Tabs as TTabs, styled } from 'tamagui'

export const Tabs = TTabs

export const TabsList = styled(TTabs.List, {
  name: 'AppTabsList',
  backgroundColor: '$background',
  borderColor: '$borderColor',
  borderWidth: 1,
  borderRadius: 12,
  padding: 4,
})

export const TabsTrigger = styled(TTabs.Tab, {
  name: 'AppTabsTrigger',
  borderRadius: 8,
  paddingVertical: 6,
  paddingHorizontal: 10,
  color: '$color',
  focusStyle: {
    bg: '$borderColor',
  },
  pressStyle: {
    bg: '$borderColor',
  },
})

export const TabsContent = styled(TTabs.Content, {
  name: 'AppTabsContent',
  paddingTop: 12,
})
