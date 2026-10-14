import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import TipCalculatorScreen from './src/screens/TipCalculatorScreen';

export default function App() {
  return (
    <SafeAreaProvider>
      <TipCalculatorScreen />
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}
