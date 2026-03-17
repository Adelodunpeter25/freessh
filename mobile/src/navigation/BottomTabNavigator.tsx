import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import {
  Home,
  LayoutGrid,
  Settings,
  Shield,
  Server,
} from 'lucide-react-native'

import {
  HomeScreen,
  ConnectionsScreen,
  SettingsScreen,
} from '../screens'
import { useThemeStore } from '../stores'

export type RootTabParamList = {
  Home: undefined
  Connections: undefined
  Settings: undefined
}

const Tab = createBottomTabNavigator<RootTabParamList>()

export function BottomTabNavigator() {
  const theme = useThemeStore((state) => state.theme)

  return (
    <Tab.Navigator
      screenOptions={{
        headerTitleAlign: 'center',
        tabBarLabelStyle: { fontSize: 11, fontWeight: '500' },
        tabBarActiveTintColor: '#f97316',
        tabBarInactiveTintColor: theme === 'dark' ? '#64748b' : '#94a3b8',
        tabBarStyle: {
          backgroundColor: theme === 'dark' ? '#0a0a0a' : '#ffffff',
          borderTopColor: theme === 'dark' ? '#1f2937' : '#e2e8f0',
          height: 65,
          paddingBottom: 8,
          paddingTop: 8,
        },
        headerStyle: {
          backgroundColor: theme === 'dark' ? '#0a0a0a' : '#ffffff',
          borderBottomColor: theme === 'dark' ? '#1f2937' : '#e2e8f0',
        },
        headerTitleStyle: {
          color: theme === 'dark' ? '#f1f5f9' : '#0f172a',
          fontWeight: '700',
        },
        headerTintColor: theme === 'dark' ? '#f1f5f9' : '#0f172a',
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          headerTitle: 'Vault',
          tabBarLabel: 'Vault',
          tabBarIcon: ({ color }) => <Shield size={22} color={color} />,
        }}
      />
      <Tab.Screen
        name="Connections"
        component={ConnectionsScreen}
        options={{
          tabBarIcon: ({ color }) => <Server size={22} color={color} />,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ color }) => <Settings size={22} color={color} />,
        }}
      />
    </Tab.Navigator>
  )
}
