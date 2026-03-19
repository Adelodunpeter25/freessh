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
        tabBarActiveTintColor: theme === 'dark' ? '#f1f5f9' : '#0f172a',
        tabBarInactiveTintColor: theme === 'dark' ? '#64748b' : '#94a3b8',
        tabBarStyle: {
          backgroundColor: theme === 'dark' ? '#0b0e14' : '#eef2f7',
          borderTopColor: theme === 'dark' ? '#2c3747' : '#d7e1ec',
          height: 65,
          paddingBottom: 8,
          paddingTop: 8,
        },
        headerStyle: {
          backgroundColor: theme === 'dark' ? '#0b0e14' : '#eef2f7',
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
          tabBarIcon: ({ color, focused }) => (
            <View
              borderRadius={focused ? 12 : 10}
              borderWidth={focused ? 2.5 : 1}
              borderColor={focused ? (theme === 'dark' ? '#3f4957' : '#cfd7e2') : 'transparent'}
              backgroundColor={focused ? (theme === 'dark' ? '#1f2a39' : '#eaf1f9') : 'transparent'}
              style={{
                minWidth: focused ? 74 : 46,
                alignItems: 'center',
                justifyContent: 'center',
                paddingHorizontal: focused ? 22 : 12,
                paddingVertical: focused ? 6 : 6,
              }}
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
              borderRadius={focused ? 12 : 10}
              borderWidth={focused ? 2.5 : 1}
              borderColor={focused ? (theme === 'dark' ? '#3f4957' : '#cfd7e2') : 'transparent'}
              backgroundColor={focused ? (theme === 'dark' ? '#1f2a39' : '#eaf1f9') : 'transparent'}
              style={{
                minWidth: focused ? 74 : 46,
                alignItems: 'center',
                justifyContent: 'center',
                paddingHorizontal: focused ? 22 : 12,
                paddingVertical: focused ? 6 : 6,
              }}
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
              borderRadius={focused ? 12 : 10}
              borderWidth={focused ? 2.5 : 1}
              borderColor={focused ? (theme === 'dark' ? '#3f4957' : '#cfd7e2') : 'transparent'}
              backgroundColor={focused ? (theme === 'dark' ? '#1f2a39' : '#eaf1f9') : 'transparent'}
              style={{
                minWidth: focused ? 74 : 46,
                alignItems: 'center',
                justifyContent: 'center',
                paddingHorizontal: focused ? 22 : 12,
                paddingVertical: focused ? 6 : 6,
              }}
            >
              <Settings size={18} color={color} />
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  )
}
