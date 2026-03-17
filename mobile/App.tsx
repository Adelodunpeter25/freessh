import '@tamagui/native/setup-zeego'
import { StatusBar } from 'expo-status-bar'
import { useEffect } from 'react'
import { Appearance } from 'react-native'
import { TamaguiProvider } from 'tamagui'
import { MenuProvider } from 'react-native-popup-menu'

import { AppNavigator } from './src/navigation/AppNavigator'
import { useThemeStore, useConnectionStore, useGroupStore, useSnippetStore, useKeyStore, useLogStore, useKnownHostStore } from './src/stores'
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

  useEffect(() => {
    // Initializing SQLite
    const init = async () => {
       try {
         await import('./src/services/db/schema').then(async (m) => {
           await m.initDatabase()
           // Initialize stores after DB is ready
           initConnections()
           initGroups()
           initSnippets()
           initKeys()
           initLogs()
           initKnownHosts()
         })
       } catch (error) {
         console.error('Failed to init database:', error)
       }
    }
    init()

    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemTheme(colorScheme === 'dark' ? 'dark' : 'light')
    })

    return () => subscription.remove()
  }, [setSystemTheme])

  return (
    <TamaguiProvider config={tamaguiConfig} defaultTheme={theme}>
      <MenuProvider>
        <AppNavigator />
        <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      </MenuProvider>
    </TamaguiProvider>
  )
}
