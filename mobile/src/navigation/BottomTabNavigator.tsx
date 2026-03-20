import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import {
  Home,
  Settings,
  Server,
} from 'lucide-react-native'
import { useTheme } from 'tamagui'

import { HomeScreen } from '../screens/home/HomeScreen'
import { ConnectionsScreen } from '../screens/connections/ConnectionsScreen'
import { SettingsScreen } from '../screens/settings/SettingsScreen'

export type RootTabParamList = {
  Home: undefined
  Connections: undefined
  Settings: undefined
}

const Tab = createBottomTabNavigator<RootTabParamList>()

export function BottomTabNavigator() {
  const tamaguiTheme = useTheme()

  return (
    <Tab.Navigator
      screenOptions={{
        headerTitleAlign: 'center',
        tabBarLabelStyle: { fontSize: 11, fontWeight: '500' },
        tabBarActiveTintColor: tamaguiTheme.accent.get(),
        tabBarInactiveTintColor: tamaguiTheme.colorMuted.get(),
        tabBarStyle: {
          backgroundColor: tamaguiTheme.tabBarBackground.get(),
          borderTopColor: tamaguiTheme.borderColor.get(),
          height: 65,
          paddingBottom: 8,
          paddingTop: 8,
        },
        headerStyle: {
          backgroundColor: tamaguiTheme.headerBackground.get(),
          borderBottomColor: tamaguiTheme.borderColor.get(),
        },
        headerTitleStyle: {
          color: tamaguiTheme.color.get(),
          fontWeight: '700',
        },
        headerTintColor: tamaguiTheme.color.get(),
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
