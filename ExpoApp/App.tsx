import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import { DeviceUsageProvider } from './src/contexts/DeviceUsageContext';
import { UsageTableScreen } from './src/screens/UsageTableScreen';

export default function App() {
  return (
    <DeviceUsageProvider>
      <UsageTableScreen />
      <StatusBar style="auto" />
    </DeviceUsageProvider>
  );
}
