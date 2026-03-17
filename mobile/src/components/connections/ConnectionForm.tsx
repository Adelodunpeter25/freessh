import { useState } from 'react'
import { Modal, Pressable } from 'react-native'
import { Button, Input, Select, Text, XStack, YStack, View, useTheme } from 'tamagui'
import { X } from 'lucide-react-native'

import { useConnectionForm } from '../hooks'
import type { ConnectionConfig } from '../types'

type ConnectionFormProps = {
  visible: boolean
  onClose: () => void
  onSubmit: (data: ConnectionConfig) => void
  initialData?: ConnectionConfig
}

export function ConnectionForm({ visible, onClose, onSubmit, initialData }: ConnectionFormProps) {
  const theme = useTheme()
  const isEdit = !!initialData

  const { formData, errors, isSubmitting, updateField, handleSubmit } = useConnectionForm({
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
            {isEdit ? 'Edit Connection' : 'New Connection'}
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
              placeholder="Connection name"
              borderColor={errors.name ? '$red10' : '$borderColor'}
            />
            {errors.name && <Text fontSize={12} color="$red10">{errors.name}</Text>}
          </YStack>

          <YStack gap="$2">
            <Text fontSize={14} fontWeight="500" color="$color">Host</Text>
            <Input
              value={formData.host}
              onChangeText={(value) => updateField('host', value)}
              placeholder="hostname or IP address"
              borderColor={errors.host ? '$red10' : '$borderColor'}
            />
            {errors.host && <Text fontSize={12} color="$red10">{errors.host}</Text>}
          </YStack>

          <XStack gap="$3">
            <YStack flex={1} gap="$2">
              <Text fontSize={14} fontWeight="500" color="$color">Port</Text>
              <Input
                value={formData.port}
                onChangeText={(value) => updateField('port', value)}
                placeholder="22"
                keyboardType="numeric"
                borderColor={errors.port ? '$red10' : '$borderColor'}
              />
              {errors.port && <Text fontSize={12} color="$red10">{errors.port}</Text>}
            </YStack>

            <YStack flex={1} gap="$2">
              <Text fontSize={14} fontWeight="500" color="$color">Username</Text>
              <Input
                value={formData.username}
                onChangeText={(value) => updateField('username', value)}
                placeholder="username"
                borderColor={errors.username ? '$red10' : '$borderColor'}
              />
              {errors.username && <Text fontSize={12} color="$red10">{errors.username}</Text>}
            </YStack>
          </XStack>

          <YStack gap="$2">
            <Text fontSize={14} fontWeight="500" color="$color">Authentication</Text>
            <Select value={formData.auth_method} onValueChange={(value) => updateField('auth_method', value)}>
              <Select.Trigger>
                <Select.Value placeholder="Select auth method" />
              </Select.Trigger>
              <Select.Content>
                <Select.Item index={0} value="password">
                  <Select.ItemText>Password</Select.ItemText>
                </Select.Item>
                <Select.Item index={1} value="publickey">
                  <Select.ItemText>Public Key</Select.ItemText>
                </Select.Item>
              </Select.Content>
            </Select>
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
