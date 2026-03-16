import { StatusBar } from 'expo-status-bar';
import { TamaguiProvider, Theme } from 'tamagui';
import { AppNavigator } from './src/navigation/AppNavigator';
import tamaguiConfig from './tamagui.config';

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
