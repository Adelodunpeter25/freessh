import { Modal, Pressable } from 'react-native'
import { Button, Input, Select, Text, XStack, YStack, View, useTheme } from 'tamagui'
import { X } from 'lucide-react-native'

import { useKeyForm } from '../hooks'
import type { Key } from '../types'

type KeyFormProps = {
  visible: boolean
  onClose: () => void
  onSubmit: (data: Key) => void
  initialData?: Key
}

export function KeyForm({ visible, onClose, onSubmit, initialData }: KeyFormProps) {
  const theme = useTheme()
  const isEdit = !!initialData

  const { formData, errors, isSubmitting, updateField, handleSubmit } = useKeyForm({
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
            {isEdit ? 'Edit Key' : 'Generate New Key'}
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
              placeholder="Key name"
              borderColor={errors.name ? '$red10' : '$borderColor'}
            />
            {errors.name && <Text fontSize={12} color="$red10">{errors.name}</Text>}
          </YStack>

          <YStack gap="$2">
            <Text fontSize={14} fontWeight="500" color="$color">Key Type</Text>
            <Select value={formData.type} onValueChange={(value) => updateField('type', value)}>
              <Select.Trigger>
                <Select.Value placeholder="Select key type" />
              </Select.Trigger>
              <Select.Content>
                <Select.Item index={0} value="ed25519">
                  <Select.ItemText>Ed25519 (Recommended)</Select.ItemText>
                </Select.Item>
                <Select.Item index={1} value="rsa">
                  <Select.ItemText>RSA</Select.ItemText>
                </Select.Item>
              </Select.Content>
            </Select>
          </YStack>

          {formData.type === 'rsa' && (
            <YStack gap="$2">
              <Text fontSize={14} fontWeight="500" color="$color">Key Size</Text>
              <Select value={formData.bits?.toString()} onValueChange={(value) => updateField('bits', parseInt(value))}>
                <Select.Trigger>
                  <Select.Value placeholder="Select key size" />
                </Select.Trigger>
                <Select.Content>
                  <Select.Item index={0} value="2048">
                    <Select.ItemText>2048 bits</Select.ItemText>
                  </Select.Item>
                  <Select.Item index={1} value="4096">
                    <Select.ItemText>4096 bits</Select.ItemText>
                  </Select.Item>
                </Select.Content>
              </Select>
            </YStack>
          )}

          <YStack gap="$2">
            <Text fontSize={14} fontWeight="500" color="$color">Passphrase (Optional)</Text>
            <Input
              value={formData.passphrase}
              onChangeText={(value) => updateField('passphrase', value)}
              placeholder="Enter passphrase to protect key"
              secureTextEntry
            />
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
            {isSubmitting ? 'Generating...' : isEdit ? 'Update' : 'Generate'}
          </Button>
        </XStack>
      </View>
    </Modal>
  )
}
