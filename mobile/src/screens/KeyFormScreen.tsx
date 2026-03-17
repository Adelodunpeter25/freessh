import { Button, Input, Text, YStack } from 'tamagui'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'

import { AppHeader, Screen, Select } from '@/components'
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

          <Select
            label="Key Type"
            value={formData.type}
            onValueChange={(value) => updateField('type', value)}
            options={[
              { label: 'Ed25519 (Recommended)', value: 'ed25519' },
              { label: 'RSA', value: 'rsa' }
            ]}
          />

          {formData.type === 'rsa' && (
            <Select
              label="Key Size"
              value={formData.bits?.toString() || '2048'}
              onValueChange={(value) => updateField('bits', parseInt(value))}
              options={[
                { label: '2048 bits', value: '2048' },
                { label: '4096 bits', value: '4096' }
              ]}
            />
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
