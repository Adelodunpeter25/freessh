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
          backgroundColor: theme === 'dark' ? '#141a22' : '#f7fafd',
          borderTopColor: theme === 'dark' ? '#2c3747' : '#d7e1ec',
          height: 65,
          paddingBottom: 8,
          paddingTop: 8,
        },
        headerStyle: {
          backgroundColor: theme === 'dark' ? '#141a22' : '#f7fafd',
          borderBottomColor: theme === 'dark' ? '#2c3747' : '#d7e1ec',
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
          headerTitle: 'Home',
          tabBarLabel: 'Home',
          tabBarIcon: ({ color }) => <Home size={22} color={color} />,
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
