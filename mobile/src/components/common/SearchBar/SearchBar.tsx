import { Text, XStack } from 'tamagui'

import { Input } from '../Input'
import { IconButton } from '../IconButton'

type SearchBarProps = {
  value: string
  onChangeText: (value: string) => void
  placeholder?: string
  onClear?: () => void
}

export function SearchBar({
  value,
  onChangeText,
  placeholder = 'Search',
  onClear,
}: SearchBarProps) {
  return (
    <XStack alignItems="center" gap="$2">
      <Input
        flex={1}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
      />
      {value.length > 0 ? (
        <IconButton onPress={onClear}>
          <Text>✕</Text>
        </IconButton>
      ) : null}
    </XStack>
  )
}
