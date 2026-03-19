import '@tamagui/native/setup-zeego'
import { StatusBar } from 'expo-status-bar'
import { useEffect, useState } from 'react'
import { Appearance } from 'react-native'
import { TamaguiProvider, Spinner, YStack } from 'tamagui'
import { MenuProvider } from 'react-native-popup-menu'

import { AppNavigator } from './src/navigation/AppNavigator'
import { useThemeStore, useConnectionStore, useGroupStore, useSnippetStore, useKeyStore, useLogStore, useKnownHostStore, useSnackbarStore } from './src/stores'
import tamaguiConfig from './tamagui.config'
import { Snackbar } from './src/components'

export default function App() {
  const theme = useThemeStore((state) => state.theme)
  const setSystemTheme = useThemeStore((state) => state.setSystemTheme)
  const [isReady, setIsReady] = useState(false)
  
  const initConnections = useConnectionStore(s => s.initialize)
  const initGroups = useGroupStore(s => s.initialize)
  const initSnippets = useSnippetStore(s => s.initialize)
  const initKeys = useKeyStore(s => s.initialize)
  const initLogs = useLogStore(s => s.initialize)
  const initKnownHosts = useKnownHostStore(s => s.initialize)
  const snackbarOpen = useSnackbarStore((s) => s.open)
  const snackbarMessage = useSnackbarStore((s) => s.message)
  const snackbarVariant = useSnackbarStore((s) => s.variant)

  useEffect(() => {
    const init = async () => {
       try {
         // Dynamic import to keep initial bundle small
         const { initDatabase } = await import('./src/services/db/schema')
         await initDatabase()
         
         // Parallelize store initializations for faster startup
         await Promise.all([
           initConnections(),
           initGroups(),
           initSnippets(),
           initKeys(),
           initLogs(),
           initKnownHosts()
         ])
       } catch (error) {
         console.error('Startup failed:', error)
       } finally {
         setIsReady(true)
       }
    }
    init()

    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemTheme(colorScheme === 'dark' ? 'dark' : 'light')
    })

    return () => subscription.remove()
  }, [])

  if (!isReady) {
    return (
      <TamaguiProvider config={tamaguiConfig} defaultTheme={theme}>
        <YStack flex={1} ai="center" jc="center" bg={theme === 'dark' ? '#09090b' : '#f8fafc'}>
          <Spinner size="large" color="$accent" />
        </YStack>
      </TamaguiProvider>
    )
  }

  return (
    <TamaguiProvider config={tamaguiConfig} defaultTheme={theme}>
      <MenuProvider>
        <AppNavigator />
        <Snackbar open={snackbarOpen} message={snackbarMessage} variant={snackbarVariant} />
        <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      </MenuProvider>
    </TamaguiProvider>
  )
}
