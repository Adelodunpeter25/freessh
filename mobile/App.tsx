import '@tamagui/native/setup-zeego'
import { StatusBar } from 'expo-status-bar'
import { useEffect } from 'react'
import { Appearance } from 'react-native'
import { TamaguiProvider, Theme } from 'tamagui'

import { AppNavigator } from './src/navigation/AppNavigator'
import { useThemeStore } from './src/stores'
import tamaguiConfig from './tamagui.config'

export default function App() {
  const theme = useThemeStore((state) => state.theme)
  const setSystemTheme = useThemeStore((state) => state.setSystemTheme)

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemTheme(colorScheme === 'dark' ? 'dark' : 'light')
    })

    return () => subscription.remove()
  }, [setSystemTheme])

  return (
    <TamaguiProvider config={tamaguiConfig}>
      <Theme name={theme}>
        <AppNavigator />
        <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      </Theme>
    </TamaguiProvider>
  )
}
