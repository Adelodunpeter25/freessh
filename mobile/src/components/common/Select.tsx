import { Select as TSelect, Adapt, Sheet, YStack, Text } from 'tamagui'
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
  return (
    <YStack gap="$2">
      {label && (
        <Text fontSize={14} fontWeight="600" color="$color">
          {label}
        </Text>
      )}
      <TSelect value={value} onValueChange={onValueChange}>
        <TSelect.Trigger iconAfter={ChevronDown} borderColor={error ? '$red10' : '$borderColor'}>
          <TSelect.Value placeholder={placeholder} />
        </TSelect.Trigger>

        <Adapt when="sm" platform="touch">
          <Sheet
            modal
            dismissOnSnapToBottom
          >
            <Sheet.Frame>
              <Sheet.ScrollView>
                <Adapt.Contents />
              </Sheet.ScrollView>
            </Sheet.Frame>
            <Sheet.Overlay />
          </Sheet>
        </Adapt>

        <TSelect.Content>
          <TSelect.ScrollUpButton />
          <TSelect.Viewport minWidth={200}>
            <TSelect.Group>
              {options.map((option, i) => (
                <TSelect.Item index={i} key={option.value} value={option.value}>
                  <TSelect.ItemText>{option.label}</TSelect.ItemText>
                  <TSelect.ItemIndicator marginLeft="auto">
                    <Check size={16} color="$accent" />
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
