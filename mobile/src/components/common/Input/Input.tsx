import { Input as TInput, styled } from 'tamagui'

export const Input = styled(TInput, {
  name: 'AppInput',
  borderWidth: 1,
  borderColor: '$borderColor',
  backgroundColor: '$background',
  color: '$color',
  placeholderTextColor: '$placeholderColor',
  borderRadius: 10,
  paddingHorizontal: 12,
  paddingVertical: 10,
  focusStyle: {
    borderColor: '$accent',
  },
})
