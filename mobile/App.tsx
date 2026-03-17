import '@tamagui/native/setup-zeego'
import { StatusBar } from 'expo-status-bar'
import { useEffect } from 'react'
import { Appearance } from 'react-native'
import { TamaguiProvider } from 'tamagui'

import { AppNavigator } from './src/navigation/AppNavigator'
import { useThemeStore } from './src/stores'
import tamaguiConfig from './tamagui.config'

export default function App() {
  const theme = useThemeStore((state) => state.theme)
  const setSystemTheme = useThemeStore((state) => state.setSystemTheme)

  useEffect(() => {
    // Initializing SQLite
    const init = async () => {
       try {
         await import('./src/services/db/schema').then(m => m.initDatabase())
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
      <AppNavigator />
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
    </TamaguiProvider>
  )
}
