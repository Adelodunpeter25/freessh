import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import {
  Code,
  Folder,
  HardDrive,
  Settings,
  TerminalSquare,
} from 'lucide-react-native'

import {
  ConnectionsScreen,
  SessionsScreen,
  SftpScreen,
  SnippetsScreen,
  SettingsScreen,
} from '../screens'
import { useThemeStore } from '../stores'

export type RootTabParamList = {
  Connections: undefined
  Sessions: undefined
  Sftp: undefined
  Snippets: undefined
  Settings: undefined
}

const Tab = createBottomTabNavigator<RootTabParamList>()

export function BottomTabNavigator() {
  const theme = useThemeStore((state) => state.theme)

  return (
    <Tab.Navigator
      screenOptions={{
        headerTitleAlign: 'center',
        tabBarLabelStyle: { fontSize: 11 },
        tabBarActiveTintColor: '#f97316',
        tabBarInactiveTintColor: theme === 'dark' ? '#94a3b8' : '#64748b',
        tabBarStyle: {
          backgroundColor: theme === 'dark' ? '#0f0f0f' : '#ffffff',
          borderTopColor: theme === 'dark' ? '#1f2937' : '#e2e8f0',
          height: 65,
          paddingBottom: 8,
          paddingTop: 8,
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
        component={ConnectionsScreen}
        options={{
          tabBarIcon: ({ color }) => <Folder size={20} color={color} />,
        }}
      />
      <Tab.Screen
        name="Sessions"
        component={SessionsScreen}
        options={{
          tabBarIcon: ({ color }) => <TerminalSquare size={20} color={color} />,
        }}
      />
      <Tab.Screen
        name="Sftp"
        component={SftpScreen}
        options={{
          title: 'SFTP',
          tabBarIcon: ({ color }) => <HardDrive size={20} color={color} />,
        }}
      />
      <Tab.Screen
        name="Snippets"
        component={SnippetsScreen}
        options={{
          tabBarIcon: ({ color }) => <Code size={20} color={color} />,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ color }) => <Settings size={20} color={color} />,
        }}
      />
    </Tab.Navigator>
  )
}
