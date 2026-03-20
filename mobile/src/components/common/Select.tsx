import { Select as TSelect, Adapt, YStack, Text, useTheme } from 'tamagui'
import { ChevronDown, Check } from 'lucide-react-native'

import { Sheet } from './Sheet'

type SelectProps = {
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  label?: string
  options: { label: string; value: string }[]
  error?: string
  disabled?: boolean
}

export function Select({ value, onValueChange, placeholder, label, options, error, disabled }: SelectProps) {
  const theme = useTheme()
  
  return (
    <YStack gap="$2">
      {label && (
        <Text fontSize={14} fontWeight="600" color="$color">
          {label}
        </Text>
      )}
      <TSelect value={value} onValueChange={onValueChange}>
        <TSelect.Trigger 
          iconAfter={ChevronDown} 
          borderColor={error ? '$red10' : '$borderColor'}
          borderRadius={10}
          paddingHorizontal={12}
          height={44}
          backgroundColor={disabled ? '$backgroundStrong' : '$background'}
          opacity={disabled ? 0.6 : 1}
          disabled={disabled}
          focusStyle={{ borderColor: '$accent' }}
        >
          <TSelect.Value placeholder={placeholder} color="$color" />
        </TSelect.Trigger>

        <Adapt when="sm" platform="touch">
          <Sheet
            modal
            dismissOnSnapToBottom
            snapPoints={[35]}
            position={0}
            // @ts-ignore
            animation="quick"
          >
            {/* @ts-ignore */}
            <Sheet.Frame backgroundColor="$background">
              <Sheet.ScrollView>
                <Adapt.Contents />
              </Sheet.ScrollView>
            </Sheet.Frame>
            {/* @ts-ignore */}
            <Sheet.Overlay 
              enterStyle={{ opacity: 0 }}
              exitStyle={{ opacity: 0 }}
            />
          </Sheet>
        </Adapt>

        <TSelect.Content>
          <TSelect.ScrollUpButton />
          <TSelect.Viewport minWidth={200}>
            <TSelect.Group>
              {options.map((option, i) => (
                <TSelect.Item index={i} key={option.value} value={option.value}>
                  <TSelect.ItemText color="$color">{option.label}</TSelect.ItemText>
                  <TSelect.ItemIndicator marginLeft="auto">
                    <Check size={16} color={theme.accent.get()} />
                  </TSelect.ItemIndicator>
                </TSelect.Item>
              ))}
            </TSelect.Group>
          </TSelect.Viewport>
          <TSelect.ScrollDownButton />
        </TSelect.Content>
      </TSelect>
      {error && (
        <Text fontSize={12} color="$red10">
          {error}
        </Text>
      )}
    </YStack>
  )
}
