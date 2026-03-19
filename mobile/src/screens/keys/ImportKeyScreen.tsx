import { useState } from 'react'
import { Text, TextArea, XStack, YStack, useTheme } from 'tamagui'
import { Eye, EyeOff } from 'lucide-react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'

import { AppHeader, Button, IconButton, Input, Screen } from '@/components'
import { useKeyStore, useSnackbarStore } from '@/stores'
import type { ConnectionsStackParamList } from '@/navigation/AppNavigator'

type Props = NativeStackScreenProps<ConnectionsStackParamList, 'ImportKey'>

export function ImportKeyScreen({ navigation }: Props) {
  const t = useTheme()
  const importKey = useKeyStore((state) => state.importKey)
  const showSnackbar = useSnackbarStore((state) => state.show)

  const [name, setName] = useState('')
  const [privateKey, setPrivateKey] = useState('')
  const [passphrase, setPassphrase] = useState('')
  const [showPassphrase, setShowPassphrase] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleImport = async () => {
    if (!name.trim()) {
      showSnackbar('Key name is required', 'error')
      return
    }

    if (!privateKey.trim()) {
      showSnackbar('Private key is required', 'error')
      return
    }

    setSubmitting(true)
    try {
      await importKey(name.trim(), privateKey.trim(), passphrase.trim() || undefined)
      showSnackbar('Key imported', 'success')
      navigation.goBack()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to import key'
      showSnackbar(message, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <YStack flex={1}>
      <AppHeader title="Import Key" showBackButton onBackPress={() => navigation.goBack()} />
      <Screen keyboardAvoiding keyboardOffset={48}>
        <YStack gap="$4">
          <YStack gap="$2">
            <XStack ai="center" gap="$1">
              <Text fontSize={13} fontWeight="600" color="$color">Name</Text>
              <Text fontSize={13} fontWeight="600" color="$red10">*</Text>
            </XStack>
            <Input
              value={name}
              onChangeText={setName}
              placeholder="Key name (e.g. Work Laptop)"
              borderColor="$borderColor"
            />
          </YStack>

          <YStack gap="$2">
            <XStack ai="center" gap="$1">
              <Text fontSize={13} fontWeight="600" color="$color">Private Key</Text>
              <Text fontSize={13} fontWeight="600" color="$red10">*</Text>
            </XStack>
            <TextArea
              value={privateKey}
              onChangeText={setPrivateKey}
              placeholder="Paste your private key here"
              numberOfLines={10}
              borderColor="$borderColor"
              borderRadius={10}
            />
          </YStack>

          <YStack gap="$2">
            <Text fontSize={13} fontWeight="600" color="$color">Passphrase (Optional)</Text>
            <XStack alignItems="center" position="relative">
              <Input
                flex={1}
                value={passphrase}
                onChangeText={setPassphrase}
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

          <Button onPress={handleImport} disabled={submitting} marginTop="$2" height={50}>
            {submitting ? 'Importing...' : 'Import Key'}
          </Button>
        </YStack>
      </Screen>
    </YStack>
  )
}

