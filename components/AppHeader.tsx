import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { User } from '@supabase/supabase-js';
import { colors, ui } from '../constants/theme';

export function AppHeader({ user, accountPage = false }: { user: User | null; accountPage?: boolean }) {
  return <View style={styles.header}>
    <View style={styles.brandRow}>
    <Link href="/" accessibilityLabel="GoodEats: ir al inicio">
      <Text style={styles.logo}>Good<Text style={styles.logoEnd}>Eats</Text></Text>
    </Link>
    <Link href={accountPage ? '/lista' : '/login'} asChild>
      <Pressable accessibilityRole="link" accessibilityLabel={accountPage ? 'Volver a la lista' : user ? 'Mi cuenta' : 'Iniciar sesión'} style={styles.button}>
        <Text style={styles.buttonText}>{accountPage ? 'Volver' : user ? 'Mi cuenta' : 'Entrar'}</Text>
      </Pressable>
    </Link>
    </View>
  </View>;
}
const styles = StyleSheet.create({
  header: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 12, paddingBottom: 24, borderBottomWidth: 1, borderBottomColor: colors.border },
  brandRow: { width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 20 },
  logo: { fontSize: 28, fontWeight: '800', letterSpacing: -1.2, color: colors.primary }, logoEnd: { color: colors.accent },
  button: { minHeight: 48, paddingHorizontal: 16, paddingVertical: 12, borderRadius: ui.radius.control, backgroundColor: colors.primary, justifyContent: 'center' },
  buttonText: { fontSize: 14, fontWeight: '700', color: colors.onPrimary },
});
