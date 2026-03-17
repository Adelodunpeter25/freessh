import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
  Theme,
} from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { enableScreens } from 'react-native-screens'

import { GroupDetailsScreen } from '../screens'
import { useThemeStore } from '../stores'
import { BottomTabNavigator } from './BottomTabNavigator'

enableScreens()

export type ConnectionsStackParamList = {
  Main: undefined
  GroupDetails: { groupId: string }
}

const Stack = createNativeStackNavigator<ConnectionsStackParamList>()

const lightNavTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#f8fafc',
    card: '#ffffff',
    text: '#0f172a',
    border: '#e2e8f0',
    primary: '#f97316',
  },
}

const darkNavTheme: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: '#0a0a0a',
    card: '#0f0f0f',
    text: '#f1f5f9',
    border: '#1f2937',
    primary: '#f97316',
  },
}

export function AppNavigator() {
  const theme = useThemeStore((state) => state.theme)
  const navigationTheme = theme === 'dark' ? darkNavTheme : lightNavTheme

  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'fade',
        }}
      >
        <Stack.Screen
          name="Main"
          component={BottomTabNavigator}
        />
        <Stack.Screen
          name="GroupDetails"
          component={GroupDetailsScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  )
}
