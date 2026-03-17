import { Button, Input, Select, Text, TextArea, XStack, YStack, View, Separator, RadioGroup } from 'tamagui'
import { ChevronDown } from 'lucide-react-native'
import { useState } from 'react'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'

import { AppHeader, Screen } from '@/components'
import { useConnectionForm } from '@/hooks'
import { useConnectionStore, useGroupStore } from '@/stores'
import type { ConnectionsStackParamList } from '@/navigation/AppNavigator'

type Props = NativeStackScreenProps<ConnectionsStackParamList, 'ConnectionForm'>

export function ConnectionFormScreen({ route, navigation }: Props) {
  const { connection } = route.params
  const isEdit = !!connection
  const addConnection = useConnectionStore((state) => state.addConnection)
  const updateConnection = useConnectionStore((state) => state.updateConnection)
  const groups = useGroupStore((state) => state.groups)
  
  const [keyMode, setKeyMode] = useState<'existing' | 'new'>('existing')

  const { formData, errors, isSubmitting, updateField, handleSubmit } = useConnectionForm({
    initialData: connection,
    onSubmit: async (data) => {
      if (isEdit) {
        updateConnection(data)
      } else {
        addConnection(data)
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
            <Text fontSize={14} fontWeight="600" color="$color">General</Text>
            
            <Input
              value={formData.name}
              onChangeText={(value) => updateField('name', value)}
              placeholder="Connection Name"
              borderColor={errors.name ? '$red10' : '$borderColor'}
            />
            {errors.name && <Text fontSize={12} color="$red10">{errors.name}</Text>}

            <Select value={formData.group || ''} onValueChange={(value) => updateField('group', value || undefined)}>
              <Select.Trigger 
                iconAfter={ChevronDown}
                hoverStyle={{ backgroundColor: '$backgroundHover' }}
              >
                <Select.Value placeholder="Select Group (Optional)" />
              </Select.Trigger>
              <Select.Content zIndex={200000}>
                <Select.Viewport>
                  <Select.Item index={0} value="">
                    <Select.ItemText>No Group</Select.ItemText>
                  </Select.Item>
                  {groups.map((group, index) => (
                    <Select.Item key={group.id} index={index + 1} value={group.id}>
                      <Select.ItemText>{group.name}</Select.ItemText>
                    </Select.Item>
                  ))}
                </Select.Viewport>
              </Select.Content>
            </Select>

            <Input
              value={formData.host}
              onChangeText={(value) => updateField('host', value)}
              placeholder="Host"
              borderColor={errors.host ? '$red10' : '$borderColor'}
            />
            {errors.host && <Text fontSize={12} color="$red10">{errors.host}</Text>}

            <XStack gap="$2" alignItems="center">
              <Text fontSize={14} color="$placeholderColor">SSH on</Text>
              <Input
                flex={1}
                value={formData.port}
                onChangeText={(value) => updateField('port', value)}
                placeholder="22"
                keyboardType="numeric"
                borderColor={errors.port ? '$red10' : '$borderColor'}
              />
              <Text fontSize={14} color="$placeholderColor">port</Text>
            </XStack>
            {errors.port && <Text fontSize={12} color="$red10">{errors.port}</Text>}
          </YStack>

          <Separator />

          {/* Credentials Section */}
          <YStack gap="$4">
            <Text fontSize={14} fontWeight="600" color="$color">Credentials</Text>
            
            <Input
              value={formData.username}
              onChangeText={(value) => updateField('username', value)}
              placeholder="Username"
              borderColor={errors.username ? '$red10' : '$borderColor'}
            />
            {errors.username && <Text fontSize={12} color="$red10">{errors.username}</Text>}

            <Select 
              value={formData.auth_method} 
              onValueChange={(value) => updateField('auth_method', value)}
            >
              <Select.Trigger 
                iconAfter={ChevronDown}
                hoverStyle={{ backgroundColor: '$backgroundHover' }}
              >
                <Select.Value placeholder="Authentication Method" />
              </Select.Trigger>
              <Select.Content zIndex={200000}>
                <Select.Viewport>
                  <Select.Item index={0} value="password">
                    <Select.ItemText>Password</Select.ItemText>
                  </Select.Item>
                  <Select.Item index={1} value="publickey">
                    <Select.ItemText>Public Key</Select.ItemText>
                  </Select.Item>
                </Select.Viewport>
              </Select.Content>
            </Select>

            {formData.auth_method === 'publickey' && (
              <YStack gap="$4">
                <RadioGroup value={keyMode} onValueChange={setKeyMode}>
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
                  <Select value={formData.key_id || ''} onValueChange={(value) => updateField('key_id', value)}>
                    <Select.Trigger 
                      iconAfter={ChevronDown}
                      hoverStyle={{ backgroundColor: '$backgroundHover' }}
                    >
                      <Select.Value placeholder="Select a key" />
                    </Select.Trigger>
                    <Select.Content zIndex={200000}>
                      <Select.Viewport>
                        <Select.Item index={0} value="">
                          <Select.ItemText>No keys available. Create one first.</Select.ItemText>
                        </Select.Item>
                      </Select.Viewport>
                    </Select.Content>
                  </Select>
                ) : (
                  <TextArea
                    value={formData.private_key || ''}
                    onChangeText={(value) => updateField('private_key', value)}
                    placeholder="Private Key"
                    numberOfLines={6}
                    borderColor="$borderColor"
                  />
                )}

                <Input
                  value=""
                  onChangeText={() => {}}
                  placeholder="Passphrase (optional)"
                  secureTextEntry
                  borderColor="$borderColor"
                />
              </YStack>
            )}
          </YStack>

          <Button 
            backgroundColor="$accent" 
            onPress={handleSubmit}
            disabled={isSubmitting}
            marginTop="$4"
          >
            {isSubmitting ? 'Saving...' : isEdit ? 'Update' : 'Create'}
          </Button>
        </YStack>
      </Screen>
    </YStack>
  )
}
