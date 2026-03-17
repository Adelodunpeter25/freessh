import { Text, TextArea, XStack, YStack, View, Separator, RadioGroup, useTheme } from 'tamagui'
import { ChevronDown, Eye, EyeOff } from 'lucide-react-native'
import { useState } from 'react'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'

import { AppHeader, Screen, Select, Input, Button, IconButton } from '@/components'
import { useConnectionForm } from '@/hooks'
import { useConnectionStore, useGroupStore } from '@/stores'
import type { ConnectionsStackParamList } from '@/navigation/AppNavigator'

type Props = NativeStackScreenProps<ConnectionsStackParamList, 'ConnectionForm'>

export function ConnectionFormScreen({ route, navigation }: Props) {
  const t = useTheme()
  const { connection } = route.params
  const isEdit = !!connection
  const addConnection = useConnectionStore((state) => state.addConnection)
  const updateConnection = useConnectionStore((state) => state.updateConnection)
  const groups = useGroupStore((state) => state.groups)
  
  const [keyMode, setKeyMode] = useState<'existing' | 'new'>('existing')
  const [showPassword, setShowPassword] = useState(false)
  const [showPassphrase, setShowPassphrase] = useState(false)

  const { formData, errors, isSubmitting, updateField, handleSubmit } = useConnectionForm({
    initialData: connection,
    onSubmit: async (data) => {
      if (isEdit) {
        await updateConnection(data)
      } else {
        await addConnection(data)
      }
      navigation.goBack()
    },
  })

  return (
    <YStack flex={1}>
      <AppHeader 
        title={isEdit ? 'Edit Connection' : 'New Connection'} 
        showBackButton 
        onBackPress={() => navigation.goBack()} 
      />
      <Screen>
        <YStack gap="$6">
          {/* General Section */}
          <YStack gap="$4">
            <Text fontSize={14} fontWeight="700" color="$color">General</Text>
            
            <YStack gap="$2">
              <Text fontSize={13} fontWeight="600" color="$color">Name *</Text>
              <Input
                value={formData.name}
                onChangeText={(value) => updateField('name', value)}
                placeholder="Connection Name"
                borderColor={errors.name ? '$red10' : '$borderColor'}
              />
              {errors.name && <Text fontSize={12} color="$red10">{errors.name}</Text>}
            </YStack>

            <Select
              label="Group"
              value={formData.group || ''}
              onValueChange={(value) => updateField('group', value || '')}
              placeholder="Select Group (Optional)"
              options={[
                { label: 'No Group', value: '' },
                ...groups.map(g => ({ label: g.name, value: g.id }))
              ]}
            />

            <YStack gap="$2">
              <Text fontSize={13} fontWeight="600" color="$color">Host *</Text>
              <Input
                value={formData.host}
                onChangeText={(value) => updateField('host', value)}
                placeholder="Host (e.g. 192.168.1.1)"
                borderColor={errors.host ? '$red10' : '$borderColor'}
              />
              {errors.host && <Text fontSize={12} color="$red10">{errors.host}</Text>}
            </YStack>

            <YStack gap="$2">
              <Text fontSize={13} fontWeight="600" color="$color">Port *</Text>
              <XStack gap="$2" alignItems="center">
                <Text fontSize={14} color="$color" opacity={0.6}>SSH on</Text>
                <Input
                  flex={1}
                  value={formData.port}
                  onChangeText={(value) => updateField('port', value)}
                  placeholder="22"
                  keyboardType="numeric"
                  borderColor={errors.port ? '$red10' : '$borderColor'}
                />
                <Text fontSize={14} color="$color" opacity={0.6}>port</Text>
              </XStack>
              {errors.port && <Text fontSize={12} color="$red10">{errors.port}</Text>}
            </YStack>
          </YStack>

          <Separator />

          {/* Credentials Section */}
          <YStack gap="$4">
            <Text fontSize={14} fontWeight="700" color="$color">Credentials</Text>
            
            <YStack gap="$2">
              <Text fontSize={13} fontWeight="600" color="$color">Username *</Text>
              <Input
                value={formData.username}
                onChangeText={(value) => updateField('username', value)}
                placeholder="Username"
                borderColor={errors.username ? '$red10' : '$borderColor'}
              />
              {errors.username && <Text fontSize={12} color="$red10">{errors.username}</Text>}
            </YStack>

            <Select
              label="Authentication Method"
              value={formData.auth_method || 'password'}
              onValueChange={(value) => updateField('auth_method', value)}
              options={[
                { label: 'Password', value: 'password' },
                { label: 'Public Key', value: 'publickey' }
              ]}
            />

            {formData.auth_method === 'password' && (
              <YStack gap="$2">
                <Text fontSize={13} fontWeight="600" color="$color">Password</Text>
                <XStack alignItems="center" position="relative">
                  <Input
                    flex={1}
                    value={formData.password || ''}
                    onChangeText={(value) => updateField('password', value)}
                    placeholder="Password"
                    secureTextEntry={!showPassword}
                    borderColor="$borderColor"
                    paddingRight={44}
                  />
                  <IconButton
                    position="absolute"
                    right={4}
                    onPress={() => setShowPassword(!showPassword)}
                    icon={showPassword ? <EyeOff size={20} color={t.color.get()} /> : <Eye size={20} color={t.color.get()} />}
                  />
                </XStack>
              </YStack>
            )}

            {formData.auth_method === 'publickey' && (
              <YStack gap="$4">
                <RadioGroup value={keyMode} onValueChange={(value: string) => setKeyMode(value as 'existing' | 'new')}>
                  <XStack gap="$4">
                    <XStack gap="$2" alignItems="center">
                      <RadioGroup.Item value="existing" id="existing" size="$3">
                        <RadioGroup.Indicator />
                      </RadioGroup.Item>
                      <Text fontSize={14} color="$color">Use existing key</Text>
                    </XStack>
                    <XStack gap="$2" alignItems="center">
                      <RadioGroup.Item value="new" id="new" size="$3">
                        <RadioGroup.Indicator />
                      </RadioGroup.Item>
                      <Text fontSize={14} color="$color">Paste new key</Text>
                    </XStack>
                  </XStack>
                </RadioGroup>

                {keyMode === 'existing' ? (
                  <Select
                    label="Select Key"
                    value={formData.key_id || ''}
                    onValueChange={(value) => updateField('key_id', value)}
                    placeholder="Select a key"
                    options={[
                      { label: 'No keys available. Create one first.', value: '' }
                    ]}
                  />
                ) : (
                  <YStack gap="$2">
                    <Text fontSize={13} fontWeight="600" color="$color">Private Key</Text>
                    <TextArea
                      value={formData.private_key || ''}
                      onChangeText={(value) => updateField('private_key', value)}
                      placeholder="Paste your private key here"
                      numberOfLines={6}
                      borderColor="$borderColor"
                      borderRadius={10}
                    />
                  </YStack>
                )}

                <YStack gap="$2">
                  <Text fontSize={13} fontWeight="600" color="$color">Passphrase (Optional)</Text>
                  <XStack alignItems="center" position="relative">
                    <Input
                      flex={1}
                      value=""
                      onChangeText={() => {}}
                      placeholder="Passphrase"
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
              </YStack>
            )}
          </YStack>

          <Button 
            onPress={handleSubmit}
            disabled={isSubmitting}
            marginTop="$4"
            height={50}
          >
            {isSubmitting ? 'Saving...' : isEdit ? 'Update Connection' : 'Create Connection'}
          </Button>
        </YStack>
      </Screen>
    </YStack>
  )
}
