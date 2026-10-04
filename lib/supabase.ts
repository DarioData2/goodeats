import 'react-native-url-polyfill/auto';
import 'expo-sqlite/localStorage/install';
import { createClient } from '@supabase/supabase-js';
import { AppState, Platform } from 'react-native';
import type { Database } from '../types/database';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabasePublishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const supabaseConfigurationError = !supabaseUrl || !supabasePublishableKey
  ? 'Configura EXPO_PUBLIC_SUPABASE_URL y EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY en .env y reinicia Expo.'
  : !/^https:\/\//.test(supabaseUrl) || !supabasePublishableKey.startsWith('sb_publishable_')
    ? 'Supabase requiere una URL HTTPS y una clave publishable pública.'
    : null;

// Missing configuration must not prevent the local MVP from running.
export const supabase = supabaseConfigurationError ? null : createClient<Database>(
  supabaseUrl!, supabasePublishableKey!,
  {
    auth: {
      storage: localStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  },
);

export function requireSupabase() {
  if (!supabase) throw new Error(supabaseConfigurationError ?? 'Supabase no está disponible.');
  return supabase;
}

// Mount once at the app root; native token refresh follows foreground/background.
export function startSupabaseAuthLifecycle(): () => void {
  const client = supabase;
  if (!client || Platform.OS === 'web') return () => {};
  const refresh = (state: string) => {
    if (state === 'active') client.auth.startAutoRefresh();
    else client.auth.stopAutoRefresh();
  };
  refresh(AppState.currentState);
  const subscription = AppState.addEventListener('change', refresh);
  return () => { subscription.remove(); client.auth.stopAutoRefresh(); };
}
