import { Text, YStack, XStack, useTheme } from 'tamagui'
import { Eye, EyeOff } from 'lucide-react-native'
import { useState } from 'react'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'

import { AppHeader, Screen, Select, Input, IconButton, Button } from '@/components'
import { useKeyForm } from '@/hooks'
import { useKeyStore } from '@/stores'
import type { ConnectionsStackParamList } from '@/navigation/AppNavigator'

type Props = NativeStackScreenProps<ConnectionsStackParamList, 'KeyForm'>

export function KeyFormScreen({ route, navigation }: Props) {
  const t = useTheme()
  const { key } = route.params
  const isEdit = !!key
  const [showPassphrase, setShowPassphrase] = useState(false)

  const addKey = useKeyStore((state) => state.addKey)
  const updateKey = useKeyStore((state) => state.updateKey)

  const { formData, errors, isSubmitting, updateField, handleSubmit } = useKeyForm({
    initialData: key,
    onSubmit: async (data) => {
      if (isEdit) {
        await updateKey(data)
      } else {
        await addKey(data)
      }
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
            <Text fontSize={13} fontWeight="600" color="$color">Name</Text>
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
            <Text fontSize={13} fontWeight="600" color="$color">Passphrase (Optional)</Text>
            <XStack alignItems="center" position="relative">
              <Input
                flex={1}
                value={formData.passphrase}
                onChangeText={(value) => updateField('passphrase', value)}
                placeholder="Enter passphrase to protect key"
                secureTextEntry={!showPassphrase}
                borderColor="$borderColor"
                paddingRight={44}
              />
              <IconButton
                position="absolute"
                right={4}
                onPress={() => setShowPassphrase(!showPassphrase)}
                icon={showPassphrase ? <EyeOff size={20} color={t.color.get()} /> : <Eye size={20} color={t.color.get()} />}
              />
            </XStack>
          </YStack>

          <Button 
            onPress={handleSubmit}
            disabled={isSubmitting}
            marginTop="$4"
            height={50}
          >
            {isSubmitting ? 'Generating...' : isEdit ? 'Update Key' : 'Generate Key'}
          </Button>
        </YStack>
      </Screen>
    </YStack>
  )
}
