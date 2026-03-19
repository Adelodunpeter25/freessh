import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { View } from 'tamagui'
import {
  Home,
  Settings,
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
          headerTitle: 'Home',
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <View
              px="$3"
              py="$1.5"
              borderRadius={999}
              backgroundColor={focused ? (theme === 'dark' ? '#1f6f5f' : '#d9efe8') : 'transparent'}
            >
              <Home size={18} color={color} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Connections"
        component={ConnectionsScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View
              px="$3"
              py="$1.5"
              borderRadius={999}
              backgroundColor={focused ? (theme === 'dark' ? '#1f6f5f' : '#d9efe8') : 'transparent'}
            >
              <Server size={18} color={color} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View
              px="$3"
              py="$1.5"
              borderRadius={999}
              backgroundColor={focused ? (theme === 'dark' ? '#1f6f5f' : '#d9efe8') : 'transparent'}
            >
              <Settings size={18} color={color} />
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  )
}
