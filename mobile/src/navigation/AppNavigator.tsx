import { NavigationContainer } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import {
  Folder,
  TerminalSquare,
  HardDrive,
  Code,
  Settings,
} from 'lucide-react-native'
import { enableScreens } from 'react-native-screens'

import {
  ConnectionsScreen,
  SessionsScreen,
  SftpScreen,
  SnippetsScreen,
  SettingsScreen,
} from '../screens'

enableScreens()

export type RootTabParamList = {
  Connections: undefined
  Sessions: undefined
  Sftp: undefined
  Snippets: undefined
  Settings: undefined
}

const Tab = createBottomTabNavigator<RootTabParamList>()

export function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerTitleAlign: 'center',
          tabBarLabelStyle: { fontSize: 11 },
        }}
      >
        <Tab.Screen
          name="Connections"
          component={ConnectionsScreen}
          options={{
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
