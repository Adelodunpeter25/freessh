import { useState } from 'react'
import { Text, TextArea, YStack, XStack, useTheme } from 'tamagui'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'

import { AppHeader, Screen, Input, Button } from '@/components'
import { useSnippetForm } from '@/hooks'
import { useSnippetStore, useSnackbarStore } from '@/stores'
import type { ConnectionsStackParamList } from '@/navigation/AppNavigator'

type Props = NativeStackScreenProps<ConnectionsStackParamList, 'SnippetForm'>

export function SnippetFormScreen({ route, navigation }: Props) {
  const t = useTheme()
  const { snippet } = route.params
  const isEdit = !!snippet
  const addSnippet = useSnippetStore((state) => state.addSnippet)
  const updateSnippet = useSnippetStore((state) => state.updateSnippet)
  const showSnackbar = useSnackbarStore((state) => state.show)

  const { formData, errors, isSubmitting, updateField, handleSubmit } = useSnippetForm({
    initialData: snippet,
    onSubmit: async (data) => {
      try {
        if (isEdit) {
          await updateSnippet(data)
          showSnackbar('Snippet updated', 'success')
        } else {
          await addSnippet(data)
          showSnackbar('Snippet created', 'success')
        }
        navigation.goBack()
      } catch {
        showSnackbar('Failed to save snippet', 'error')
      }
    },
  })
  const [commandHeight, setCommandHeight] = useState(52)

  return (
    <YStack flex={1}>
      <AppHeader 
        title={isEdit ? 'Edit Snippet' : 'New Snippet'} 
        showBackButton 
        onBackPress={() => navigation.goBack()} 
      />
      <Screen keyboardAvoiding keyboardOffset={48}>
        <YStack gap="$4" flex={1}>
          <YStack gap="$2">
            <XStack ai="center" gap="$1">
              <Text fontSize={14} fontWeight="500" color="$color">Name</Text>
              <Text fontSize={14} fontWeight="500" color="$red10">*</Text>
            </XStack>
            <Input
              value={formData.name}
              onChangeText={(value) => updateField('name', value)}
              placeholder="Snippet name"
              borderColor={errors.name ? '$red10' : '$borderColor'}
            />
            {errors.name && <Text fontSize={12} color="$red10">{errors.name}</Text>}
          </YStack>

          <YStack gap="$2" flex={1}>
            <XStack ai="center" gap="$1">
              <Text fontSize={14} fontWeight="500" color="$color">Command</Text>
              <Text fontSize={14} fontWeight="500" color="$red10">*</Text>
            </XStack>
            <TextArea
              value={formData.command}
              onChangeText={(value) => updateField('command', value)}
              onContentSizeChange={(event) => {
                const next = Math.max(52, Math.min(260, event.nativeEvent.contentSize.height + 12))
                setCommandHeight(next)
              }}
              placeholder="Enter your command here..."
              placeholderTextColor={t.placeholderColor.get()}
              borderColor={errors.command ? '$red10' : '$borderColor'}
              multiline
              numberOfLines={1}
              minHeight={52}
              height={commandHeight}
            />
            {errors.command && <Text fontSize={12} color="$red10">{errors.command}</Text>}
          </YStack>

          <Button 
            backgroundColor="$accent" 
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : isEdit ? 'Update' : 'Create'}
          </Button>
        </YStack>
      </Screen>
    </YStack>
  )
}
