import { Modal, Pressable } from 'react-native'
import { Button, Input, Text, XStack, YStack, View, useTheme } from 'tamagui'
import { X } from 'lucide-react-native'

import { useGroupForm } from '@/hooks'
import type { Group } from '@/types'

type GroupFormProps = {
  visible: boolean
  onClose: () => void
  onSubmit: (data: Group) => void
  initialData?: Group
}

export function GroupForm({ visible, onClose, onSubmit, initialData }: GroupFormProps) {
  const theme = useTheme()
  const isEdit = !!initialData

  const { formData, errors, isSubmitting, updateField, handleSubmit } = useGroupForm({
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
            {isEdit ? 'Edit Group' : 'New Group'}
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
              placeholder="Group name"
              borderColor={errors.name ? '$red10' : '$borderColor'}
            />
            {errors.name && <Text fontSize={12} color="$red10">{errors.name}</Text>}
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
