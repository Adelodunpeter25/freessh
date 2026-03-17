import { Button, Input, Select, Text, YStack } from 'tamagui'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'

import { AppHeader, Screen } from '@/components'
import { useKeyForm } from '@/hooks'
import type { ConnectionsStackParamList } from '@/navigation/AppNavigator'

type Props = NativeStackScreenProps<ConnectionsStackParamList, 'KeyForm'>

export function KeyFormScreen({ route, navigation }: Props) {
  const { key } = route.params
  const isEdit = !!key

  const { formData, errors, isSubmitting, updateField, handleSubmit } = useKeyForm({
    initialData: key,
    onSubmit: async (data) => {
      // TODO: Add to key store when implemented
      console.log('Key submitted:', data)
      navigation.goBack()
    },
  })

  return (
    <YStack flex={1}>
      <AppHeader 
        title={isEdit ? 'Edit Key' : 'Generate New Key'} 
        showBackButton 
        onBackPress={() => navigation.goBack()} 
      />
      <Screen>
        <YStack gap="$4">
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

          <Button 
            backgroundColor="$accent" 
            onPress={handleSubmit}
            disabled={isSubmitting}
            marginTop="$4"
          >
            {isSubmitting ? 'Generating...' : isEdit ? 'Update' : 'Generate'}
          </Button>
        </YStack>
      </Screen>
    </YStack>
  )
}
