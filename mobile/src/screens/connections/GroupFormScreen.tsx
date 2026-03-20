import type { NativeStackScreenProps } from '@react-navigation/native-stack'

import { Text, YStack, XStack } from 'tamagui'

import { AppHeader, Button, Input, Screen } from '@/components'
import { useGroupForm } from '@/hooks'
import { useGroupStore, useSnackbarStore } from '@/stores'
import type { ConnectionsStackParamList } from '@/navigation/AppNavigator'

type Props = NativeStackScreenProps<ConnectionsStackParamList, 'GroupForm'>

export function GroupFormScreen({ route, navigation }: Props) {
  const { group } = route.params
  const isEdit = !!group
  const addGroup = useGroupStore((state) => state.addGroup)
  const updateGroup = useGroupStore((state) => state.updateGroup)
  const showSnackbar = useSnackbarStore((state) => state.show)

  const { formData, errors, isSubmitting, updateField, handleSubmit } = useGroupForm({
    initialData: group,
    onSubmit: async (data) => {
      try {
        if (isEdit) {
          await updateGroup(data)
          showSnackbar('Group updated', 'success')
        } else {
          await addGroup(data)
          showSnackbar('Group created', 'success')
        }
        navigation.goBack()
      } catch {
        showSnackbar('Failed to save group', 'error')
      }
    },
  })

  return (
    <YStack flex={1}>
      <AppHeader 
        title={isEdit ? 'Edit Group' : 'New Group'} 
        showBackButton 
        onBackPress={() => navigation.goBack()} 
      />
      <Screen keyboardAvoiding keyboardOffset={48}>
        <YStack gap="$4">
          <YStack gap="$2">
            <XStack ai="center" gap="$1">
              <Text fontSize={14} fontWeight="500" color="$color">Name</Text>
              <Text fontSize={14} fontWeight="500" color="$red10">*</Text>
            </XStack>
            <Input
              value={formData.name}
              onChangeText={(value) => updateField('name', value)}
              placeholder="Group name"
              borderColor={errors.name ? '$red10' : '$borderColor'}
            />
            {errors.name && <Text fontSize={12} color="$red10">{errors.name}</Text>}
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
