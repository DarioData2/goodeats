import { useEffect } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import ShoppingScreen from './app/index';
import { startSupabaseAuthLifecycle } from './lib/supabase';
import { useAuth } from './hooks/useAuth';
import { colors } from './constants/theme';

export default function App() {
  useEffect(startSupabaseAuthLifecycle, []);
  const auth = useAuth();
  return <SafeAreaProvider><StatusBar style="dark" />
    {auth.loading ? <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
      <ActivityIndicator accessibilityLabel="Recuperando sesión" color={colors.ink} />
    </View> : <>
      {auth.error && <Text accessibilityRole="alert" style={{ padding: 16, color: colors.danger, backgroundColor: colors.surface }}>{auth.error}</Text>}
      <ShoppingScreen key={auth.user?.id ?? 'local'} user={auth.user} />
    </>}
  </SafeAreaProvider>;
}
