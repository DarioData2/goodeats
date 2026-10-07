import { useEffect } from 'react';
import { Slot } from 'expo-router';
import { ActivityIndicator, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAccount } from '../../contexts/AuthContext';
import { startSupabaseAuthLifecycle } from '../../lib/supabase';
import { colors } from '../../constants/theme';
export default function RootLayout() {
  useEffect(startSupabaseAuthLifecycle, []);
  return <SafeAreaProvider><AuthProvider><StatusBar style="dark" /><SessionRoutes /></AuthProvider></SafeAreaProvider>;
}
function SessionRoutes() {
  const auth = useAccount();
  if (auth.loading) return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
    <ActivityIndicator accessibilityLabel="Recuperando sesión" color={colors.ink} />
  </View>;
  return <View style={{ flex: 1 }}>
    {auth.error && <Text accessibilityRole="alert" style={{ padding: 16, color: colors.danger, backgroundColor: colors.surface }}>{auth.error}</Text>}
    <Slot />
  </View>;
}
