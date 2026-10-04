import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import ShoppingScreen from './app/index';

export default function App() {
  return <SafeAreaProvider><StatusBar style="dark" /><ShoppingScreen /></SafeAreaProvider>;
}
