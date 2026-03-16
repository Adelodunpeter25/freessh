import { Button as TButton, styled } from 'tamagui'

export const Button = styled(TButton, {
  name: 'AppButton',
  borderRadius: 12,
  fontWeight: '600',
  bg: '$accent',
  color: '$accentText',
  pressStyle: {
    bg: '$accentPress',
  },
  hoverStyle: {
    bg: '$accentHover',
  },
})
