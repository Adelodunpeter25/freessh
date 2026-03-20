import '@tamagui/native/setup-zeego'
import { StatusBar } from 'expo-status-bar'
import { useEffect } from 'react'
import { Appearance } from 'react-native'
import { TamaguiProvider } from 'tamagui'
import { MenuProvider } from 'react-native-popup-menu'

import { AppNavigator } from './src/navigation/AppNavigator'
import { Snackbar } from './src/components/common/Snackbar'
import { useConnectionStore } from './src/stores/connectionStore'
import { useGroupStore } from './src/stores/groupStore'
import { useKeyStore } from './src/stores/keyStore'
import { useKnownHostStore } from './src/stores/knownHostStore'
import { useLogStore } from './src/stores/logStore'
import { useSnackbarStore } from './src/stores/snackbarStore'
import { useSnippetStore } from './src/stores/snippetStore'
import { useThemeStore } from './src/stores/themeStore'
import tamaguiConfig from './tamagui.config'

export default function App() {
  const theme = useThemeStore((state) => state.theme)
  const setSystemTheme = useThemeStore((state) => state.setSystemTheme)

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
    let cancelled = false

    const init = async () => {
       try {
         const { initDatabase } = await import('./src/services/db/schema')
         await initDatabase()
         if (cancelled) return

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
       }
    }

    const frame = requestAnimationFrame(() => {
      void init()
    })

    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemTheme(colorScheme === 'dark' ? 'dark' : 'light')
    })

    return () => {
      cancelled = true
      cancelAnimationFrame(frame)
      subscription.remove()
    }
  }, [])

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
