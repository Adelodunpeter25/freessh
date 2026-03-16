import { NavigationContainer } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'

// enableScreens() is integrated into the native stack and bottom tabs in v7
 
import {
  ConnectionsScreen,
  SessionsScreen,
  SftpScreen,
  SnippetsScreen,
  SettingsScreen,
} from '../screens'

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
        <Tab.Screen name="Connections" component={ConnectionsScreen} />
        <Tab.Screen name="Sessions" component={SessionsScreen} />
        <Tab.Screen name="Sftp" component={SftpScreen} options={{ title: 'SFTP' }} />
        <Tab.Screen name="Snippets" component={SnippetsScreen} />
        <Tab.Screen name="Settings" component={SettingsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  )
}
