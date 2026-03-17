import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
  Theme,
} from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import {
  Code,
  Folder,
  HardDrive,
  Settings,
  TerminalSquare,
} from 'lucide-react-native'
import { enableScreens } from 'react-native-screens'

import {
  ConnectionsScreen,
  GroupDetailsScreen,
  SessionsScreen,
  SftpScreen,
  SnippetsScreen,
  SettingsScreen,
} from '../screens'
import { useThemeStore } from '../stores'

enableScreens()

export type ConnectionsStackParamList = {
  ConnectionsHome: undefined
  GroupDetails: { groupId: string }
}

export type RootTabParamList = {
  Connections: undefined
  Sessions: undefined
  Sftp: undefined
  Snippets: undefined
  Settings: undefined
}

const Tab = createBottomTabNavigator<RootTabParamList>()
const ConnectionsStack = createNativeStackNavigator<ConnectionsStackParamList>()

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

function ConnectionsStackNavigator() {
  const theme = useThemeStore((state) => state.theme)

  return (
    <ConnectionsStack.Navigator
      screenOptions={{
        headerTopInsetEnabled: true,
        headerStyle: {
          backgroundColor: theme === 'dark' ? '#0f0f0f' : '#ffffff',
        },
        headerTitleStyle: {
          color: theme === 'dark' ? '#f1f5f9' : '#0f172a',
        },
        headerTintColor: theme === 'dark' ? '#f1f5f9' : '#0f172a',
      }}
    >
      <ConnectionsStack.Screen
        name="ConnectionsHome"
        component={ConnectionsScreen}
        options={{ title: 'Connections' }}
      />
      <ConnectionsStack.Screen
        name="GroupDetails"
        component={GroupDetailsScreen}
        options={{ title: 'Group Details' }}
      />
    </ConnectionsStack.Navigator>
  )
}

export function AppNavigator() {
  const theme = useThemeStore((state) => state.theme)
  const navigationTheme = theme === 'dark' ? darkNavTheme : lightNavTheme

  return (
    <NavigationContainer theme={navigationTheme}>
      <Tab.Navigator
        screenOptions={{
          headerTitleAlign: 'center',
          tabBarLabelStyle: { fontSize: 11 },
          tabBarActiveTintColor: '#f97316',
          tabBarInactiveTintColor: theme === 'dark' ? '#94a3b8' : '#64748b',
          tabBarStyle: {
            backgroundColor: theme === 'dark' ? '#0f0f0f' : '#ffffff',
            borderTopColor: theme === 'dark' ? '#1f2937' : '#e2e8f0',
          },
          headerStyle: {
            backgroundColor: theme === 'dark' ? '#0f0f0f' : '#ffffff',
          },
          headerTitleStyle: {
            color: theme === 'dark' ? '#f1f5f9' : '#0f172a',
          },
          headerTintColor: theme === 'dark' ? '#f1f5f9' : '#0f172a',
        }}
      >
        <Tab.Screen
          name="Connections"
          component={ConnectionsStackNavigator}
          options={{
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <Folder size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Sessions"
          component={SessionsScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <TerminalSquare size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Sftp"
          component={SftpScreen}
          options={{
            title: 'SFTP',
            tabBarIcon: ({ color, size }) => (
              <HardDrive size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Snippets"
          component={SnippetsScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Code size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Settings size={size} color={color} />
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  )
}
