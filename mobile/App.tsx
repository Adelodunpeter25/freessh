import '@tamagui/native/setup-zeego'
import { StatusBar } from 'expo-status-bar';
import { TamaguiProvider, Theme, setConfig } from 'tamagui';
import { AppNavigator } from './src/navigation/AppNavigator';
import tamaguiConfig from './tamagui.config';

setConfig(tamaguiConfig);

export default function App() {
  return (
    <TamaguiProvider config={tamaguiConfig}>
      <Theme name="light">
        <AppNavigator />
        <StatusBar style="auto" />
      </Theme>
    </TamaguiProvider>
  );
}
