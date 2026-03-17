import { Select as TSelect, Adapt, Sheet, YStack, Text, useTheme } from 'tamagui'
import { ChevronDown, Check } from 'lucide-react-native'
import { useState } from 'react'

type SelectProps = {
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  label?: string
  options: { label: string; value: string }[]
  error?: string
}

export function Select({ value, onValueChange, placeholder, label, options, error }: SelectProps) {
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
          backgroundColor="$background"
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
          >
            {/* @ts-ignore */}
            <Sheet.Frame backgroundColor="$background" animation="quick">
              <Sheet.ScrollView>
                <Adapt.Contents />
              </Sheet.ScrollView>
            </Sheet.Frame>
            {/* @ts-ignore */}
            <Sheet.Overlay 
              animation="quick"
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
