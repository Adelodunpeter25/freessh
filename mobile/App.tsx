import '@tamagui/native/setup-zeego'
import { StatusBar } from 'expo-status-bar'
import { useEffect } from 'react'
import { Appearance, useColorScheme } from 'react-native'
import { TamaguiProvider } from 'tamagui'

import { AppNavigator } from './src/navigation/AppNavigator'
import { useThemeStore } from './src/stores'
import tamaguiConfig from './tamagui.config'

export default function App() {
  const followSystem = useThemeStore((state) => state.followSystem)
  const theme = useThemeStore((state) => state.theme)
  const setSystemTheme = useThemeStore((state) => state.setSystemTheme)
  const scheme = useColorScheme()

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemTheme(colorScheme === 'dark' ? 'dark' : 'light')
    })

    return () => subscription.remove()
  }, [setSystemTheme])

  const resolvedTheme = followSystem
    ? scheme === 'dark'
      ? 'dark'
      : 'light'
    : theme

  return (
    <TamaguiProvider config={tamaguiConfig} defaultTheme={resolvedTheme}>
      <AppNavigator />
      <StatusBar style={resolvedTheme === 'dark' ? 'light' : 'dark'} />
    </TamaguiProvider>
  )
}
