import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { User } from '@supabase/supabase-js';
import { colors } from '../constants/theme';

export function AppHeader({ user, accountPage = false }: { user: User | null; accountPage?: boolean }) {
  return <View style={styles.header}>
    <Link href="/" accessibilityLabel="GoodEats: volver a la lista">
      <Text style={styles.logo}>G<Text style={styles.accent}>oo</Text>dEats<Text style={styles.accent}> ·</Text></Text>
    </Link>
    <Link href={accountPage ? '/' : '/login'} asChild>
      <Pressable accessibilityRole="link" style={styles.button}>
        <Text style={styles.buttonText}>{accountPage ? 'Volver a la lista' : user ? 'Mi cuenta' : 'Iniciar sesión'}</Text>
      </Pressable>
    </Link>
  </View>;
}
const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12, paddingBottom: 24, borderBottomWidth: 1, borderBottomColor: '#FFFFFF55' },
  logo: { fontSize: 28, fontWeight: '800', letterSpacing: -1.2, color: colors.surface }, accent: { color: colors.accent },
  button: { minHeight: 48, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 14, backgroundColor: colors.accent, justifyContent: 'center' },
  buttonText: { fontSize: 14, fontWeight: '700', color: colors.ink },
});
