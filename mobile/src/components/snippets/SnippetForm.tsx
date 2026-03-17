import { Modal, Pressable } from 'react-native'
import { Button, Input, Text, TextArea, XStack, YStack, View, useTheme } from 'tamagui'
import { X } from 'lucide-react-native'

import { useSnippetForm } from '@/hooks'
import type { Snippet } from '@/types'

type SnippetFormProps = {
  visible: boolean
  onClose: () => void
  onSubmit: (data: Snippet) => void
  initialData?: Snippet
}

export function SnippetForm({ visible, onClose, onSubmit, initialData }: SnippetFormProps) {
  const theme = useTheme()
  const isEdit = !!initialData

  const { formData, errors, isSubmitting, updateField, handleSubmit } = useSnippetForm({
    initialData,
    onSubmit: async (data) => {
      await onSubmit(data)
      onClose()
    },
  })

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View flex={1} backgroundColor="$background">
        {/* Header */}
        <XStack
          padding="$4"
          alignItems="center"
          justifyContent="space-between"
          borderBottomWidth={0.5}
          borderBottomColor="$borderColor"
        >
          <Text fontSize={18} fontWeight="600" color="$color">
            {isEdit ? 'Edit Snippet' : 'New Snippet'}
          </Text>
          <Pressable onPress={onClose}>
            <X size={24} color={theme.color.get()} />
          </Pressable>
        </XStack>

        {/* Form */}
        <YStack flex={1} padding="$4" gap="$4">
          <YStack gap="$2">
            <Text fontSize={14} fontWeight="500" color="$color">Name</Text>
            <Input
              value={formData.name}
              onChangeText={(value) => updateField('name', value)}
              placeholder="Snippet name"
              borderColor={errors.name ? '$red10' : '$borderColor'}
            />
            {errors.name && <Text fontSize={12} color="$red10">{errors.name}</Text>}
          </YStack>

          <YStack gap="$2" flex={1}>
            <Text fontSize={14} fontWeight="500" color="$color">Command</Text>
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
        </YStack>

        {/* Footer */}
        <XStack padding="$4" gap="$3" borderTopWidth={0.5} borderTopColor="$borderColor">
          <Button flex={1} variant="outlined" onPress={onClose}>
            Cancel
          </Button>
          <Button 
            flex={1} 
            backgroundColor="$accent" 
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : isEdit ? 'Update' : 'Create'}
          </Button>
        </XStack>
      </View>
    </Modal>
  )
}
