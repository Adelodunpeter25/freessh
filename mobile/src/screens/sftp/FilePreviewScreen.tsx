import React, { useEffect, useState, useMemo } from 'react'
import { ActivityIndicator } from 'react-native'
import { YStack, Text, ScrollView, XStack, Button } from 'tamagui'
import { ArrowLeft, HardDriveDownload } from 'lucide-react-native'
import * as FileSystem from 'expo-file-system/legacy'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'

import type { ConnectionsStackParamList } from '@/navigation/AppNavigator'
import { useSftpStore, useSnackbarStore } from '@/stores'
import {
  isLargeFile,
  isTooLargeForSyntaxHighlighting,
} from '@/utils/file'

type FilePreviewRouteProp = RouteProp<ConnectionsStackParamList, 'FilePreview'>

export function FilePreviewScreen() {
  const insets = useSafeAreaInsets()
  const navigation = useNavigation<NativeStackNavigationProp<ConnectionsStackParamList>>()
  const route = useRoute<FilePreviewRouteProp>()
  const { path, name, size } = route.params

  const [content, setContent] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const downloadEntries = useSftpStore((state) => state.downloadEntries)
  const showSnackbar = useSnackbarStore((state) => state.show)

  const tooLargeForPreview = isLargeFile(size)
  const tooLargeForHighlighting = isTooLargeForSyntaxHighlighting(size)

  useEffect(() => {
    async function loadFileContent() {
      if (tooLargeForPreview) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const cacheDir = `${FileSystem.cacheDirectory}sftp-preview/`
        await FileSystem.makeDirectoryAsync(cacheDir, { intermediates: true })
        
        // This downloads the remote file to the local cache directory
        const downloadedLocalPaths = await downloadEntries([path], cacheDir)
        
        if (downloadedLocalPaths && downloadedLocalPaths.length > 0) {
          const localFilePath = downloadedLocalPaths[0]
          const fileString = await FileSystem.readAsStringAsync(localFilePath, {
            encoding: FileSystem.EncodingType.UTF8,
          })
          setContent(fileString)
          
          // Cleanup cache right after reading to save space
          await FileSystem.deleteAsync(localFilePath, { idempotent: true }).catch(() => {})
        } else {
          throw new Error('Failed to download file for preview')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to read file')
      } finally {
        setLoading(false)
      }
    }

    void loadFileContent()
  }, [path, size, tooLargeForPreview, downloadEntries])

  const handleDownloadFullFile = async () => {
    try {
      showSnackbar(`Downloading ${name}...`, 'info')
      await downloadEntries([path])
      showSnackbar(`Downloaded ${name} successfully`, 'success')
    } catch (err) {
      showSnackbar(`Failed to download ${name}`, 'error')
    }
  }

  const renderContent = () => {
    if (loading) {
      return (
        <YStack flex={1} alignItems="center" justifyContent="center" gap="$4">
          <ActivityIndicator size="large" color="#f97316" />
          <Text color="$color" fontSize="$4">Downloading {name}...</Text>
        </YStack>
      )
    }

    if (error) {
      return (
        <YStack flex={1} alignItems="center" justifyContent="center" gap="$4" px="$6">
          <Text color="$red10" fontSize="$5" textAlign="center">Error Loading File</Text>
          <Text color="$color10" textAlign="center">{error}</Text>
        </YStack>
      )
    }

    if (tooLargeForPreview) {
      return (
        <YStack flex={1} alignItems="center" justifyContent="center" gap="$4" px="$6">
          <Text color="$color11" fontSize="$5" textAlign="center">
            File is too large completely preview ({Math.round(size / 1024)} KB).
          </Text>
          <Button
            size="$4"
            theme="active"
            icon={HardDriveDownload}
            onPress={handleDownloadFullFile}
          >
            Download to Device
          </Button>
        </YStack>
      )
    }

    if (!content) {
      return (
        <YStack flex={1} alignItems="center" justifyContent="center">
          <Text color="$color11">File is empty</Text>
        </YStack>
      )
    }

    return (
      <ScrollView flex={1} showsVerticalScrollIndicator={true} showsHorizontalScrollIndicator={false}>
        {tooLargeForHighlighting ? (
          <Text color="$color10" fontSize="$2" px="$4" pt="$3">
            Syntax highlighting disabled for large files
          </Text>
        ) : null}
        <ScrollView horizontal showsHorizontalScrollIndicator={true}>
          <Text
            fontFamily="monospace"
            fontSize={14}
            color="$color11"
            px="$4"
            py="$4"
            lineHeight={20}
          >
            {content}
          </Text>
        </ScrollView>
      </ScrollView>
    )
  }

  return (
    <YStack flex={1} bg="$background" pt={insets.top}>
      <XStack
        ai="center"
        px="$4"
        py="$3"
        borderBottomWidth={1}
        borderColor="$borderColor"
        bg="$background"
        gap="$3"
      >
        <Button
          size="$3"
          circular
          variant="outlined"
          icon={<ArrowLeft size={18} color="white" />}
          onPress={() => navigation.goBack()}
        />
        <YStack flex={1}>
          <Text color="$color" fontSize="$5" fontWeight="600" numberOfLines={1}>
            {name}
          </Text>
          <Text color="$color11" fontSize="$3">
            {Math.round(size / 1024)} KB
          </Text>
        </YStack>
      </XStack>
      {renderContent()}
    </YStack>
  )
}
