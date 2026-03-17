import { Button, Input, Text, TextArea, YStack, XStack } from 'tamagui'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'

import { AppHeader, Screen } from '@/components'
import { useSnippetForm } from '@/hooks'
import { useSnippetStore } from '@/stores'
import type { ConnectionsStackParamList } from '@/navigation/AppNavigator'

type Props = NativeStackScreenProps<ConnectionsStackParamList, 'SnippetForm'>

export function SnippetFormScreen({ route, navigation }: Props) {
  const { snippet } = route.params
  const isEdit = !!snippet
  const addSnippet = useSnippetStore((state) => state.addSnippet)
  const updateSnippet = useSnippetStore((state) => state.updateSnippet)

  const { formData, errors, isSubmitting, updateField, handleSubmit } = useSnippetForm({
    initialData: snippet,
    onSubmit: async (data) => {
      if (isEdit) {
        await updateSnippet(data)
      } else {
        await addSnippet(data)
      }
      navigation.goBack()
    },
  })

  return (
    <YStack flex={1}>
      <AppHeader 
        title={isEdit ? 'Edit Snippet' : 'New Snippet'} 
        showBackButton 
        onBackPress={() => navigation.goBack()} 
      />
      <Screen>
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
              placeholder="Enter your command here..."
              borderColor={errors.command ? '$red10' : '$borderColor'}
              flex={1}
              multiline
              numberOfLines={10}
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
