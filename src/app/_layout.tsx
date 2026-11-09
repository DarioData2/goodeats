import { useEffect } from 'react';
import { Slot } from 'expo-router';
import { useFonts } from 'expo-font';
import { ActivityIndicator, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAccount } from '../../contexts/AuthContext';
import { startSupabaseAuthLifecycle } from '../../lib/supabase';
import { ThemeProvider, useTheme } from '../../contexts/ThemeContext';
import { BottomNavigation } from '../../components/BottomNavigation';
export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({ PoppinsExtraBold: require('../../assets/fonts/Poppins-ExtraBold.ttf') });
  useEffect(startSupabaseAuthLifecycle, []);
  if (!fontsLoaded && !fontError) return null;
  return <SafeAreaProvider><ThemeProvider><ThemedApp /></ThemeProvider></SafeAreaProvider>;
}
function ThemedApp() {
  const { mode, colors, ready } = useTheme();
  if (!ready) return <View style={{ flex: 1, backgroundColor: colors.background }} />;
  return <AuthProvider><StatusBar style={mode === 'dark' ? 'light' : 'dark'} /><SessionRoutes /></AuthProvider>;
}
function SessionRoutes() {
  const { colors } = useTheme();
  const auth = useAccount();
  if (auth.loading) return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
    <ActivityIndicator accessibilityLabel="Recuperando sesión" color={colors.primary} />
  </View>;
  return <View style={{ flex: 1 }}>
    {auth.error && <Text accessibilityRole="alert" style={{ padding: 16, color: colors.danger, backgroundColor: colors.surface }}>{auth.error}</Text>}
    <View style={{ flex: 1, minHeight: 0 }}><Slot /></View>
    <BottomNavigation />
  </View>;
}
