import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
  Theme,
} from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { enableScreens } from 'react-native-screens'

import {
  GroupDetailsScreen,
  ConnectionFormScreen,
  GroupFormScreen,
  SnippetFormScreen,
  KeyFormScreen,
  ImportKeyScreen,
  KeysScreen,
  SnippetsScreen,
  SessionsScreen,
  SftpScreen,
  LogsScreen,
  KnownHostsScreen,
  TerminalSettingsScreen,
  TerminalTopBarSettingsScreen,
} from '../screens'
import { useThemeStore } from '../stores'
import { BottomTabNavigator } from './BottomTabNavigator'
import type { ConnectionConfig, Group, Snippet, SSHKey } from '@/types'

enableScreens()

export type ConnectionsStackParamList = {
  Main: undefined
  GroupDetails: { groupId: string }
  ConnectionForm: { connection?: ConnectionConfig }
  GroupForm: { group?: Group }
  SnippetForm: { snippet?: Snippet }
  KeyForm: { key?: SSHKey }
  ImportKey: undefined
  Keys: undefined
  Snippets: undefined
  Sessions: undefined
  Sftp: undefined
  History: undefined
  Logs: undefined
  KnownHosts: undefined
  TerminalSettings: undefined
  TerminalTopBarSettings: undefined
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
    background: '#09090b',
    card: '#121214',
    text: '#fafafa',
    border: '#1e1e21',
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
          animation: 'none',
          gestureEnabled: true,
          fullScreenGestureEnabled: true,
          contentStyle: {
            backgroundColor: navigationTheme.colors.background,
          },
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
        <Stack.Screen
          name="ConnectionForm"
          component={ConnectionFormScreen}
        />
        <Stack.Screen
          name="GroupForm"
          component={GroupFormScreen}
        />
        <Stack.Screen
          name="SnippetForm"
          component={SnippetFormScreen}
        />
        <Stack.Screen
          name="KeyForm"
          component={KeyFormScreen}
        />
        <Stack.Screen
          name="ImportKey"
          component={ImportKeyScreen}
        />
        <Stack.Screen
          name="Keys"
          component={KeysScreen}
        />
        <Stack.Screen
          name="Snippets"
          component={SnippetsScreen}
        />
        <Stack.Screen
          name="Sessions"
          component={SessionsScreen}
        />
        <Stack.Screen
          name="Sftp"
          component={SftpScreen}
        />
        <Stack.Screen
          name="Logs"
          component={LogsScreen}
        />
        <Stack.Screen
          name="KnownHosts"
          component={KnownHostsScreen}
        />
        <Stack.Screen
          name="TerminalSettings"
          component={TerminalSettingsScreen}
        />
        <Stack.Screen
          name="TerminalTopBarSettings"
          component={TerminalTopBarSettingsScreen}
        />
        {/* We can use KeysScreen as a placeholder for History if it doesn't exist yet */}
      </Stack.Navigator>
    </NavigationContainer>
  )
}
