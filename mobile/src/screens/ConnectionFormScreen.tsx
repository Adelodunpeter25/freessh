import { Button, Input, Select, Text, XStack, YStack, View } from 'tamagui'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'

import { AppHeader, Screen } from '@/components'
import { useConnectionForm } from '@/hooks'
import { useConnectionStore } from '@/stores'
import type { ConnectionsStackParamList } from '@/navigation/AppNavigator'

type Props = NativeStackScreenProps<ConnectionsStackParamList, 'ConnectionForm'>

export function ConnectionFormScreen({ route, navigation }: Props) {
  const { connection } = route.params
  const isEdit = !!connection
  const addConnection = useConnectionStore((state) => state.addConnection)
  const updateConnection = useConnectionStore((state) => state.updateConnection)

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
        <YStack gap="$4">
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
