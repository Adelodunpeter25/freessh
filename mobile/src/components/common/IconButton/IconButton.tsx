import { Button, styled } from 'tamagui'

export const IconButton = styled(Button, {
  name: 'AppIconButton',
  circular: true,
  size: '$3',
  chromeless: true,
  color: '$color',
  hoverStyle: {
    bg: '$borderColor',
  },
  pressStyle: {
    bg: '$borderColor',
  },
})
