import { Link, usePathname } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { User } from '@supabase/supabase-js';
import { colors } from '../constants/theme';

export function AppHeader({ user, accountPage = false }: { user: User | null; accountPage?: boolean }) {
  const pathname = usePathname();
  return <View style={styles.header}>
    <Link href="/" accessibilityLabel="GoodEats: ir al inicio">
      <Text style={styles.logo}>G<Text style={styles.accent}>oo</Text>dEats<Text style={styles.accent}> ·</Text></Text>
    </Link>
    <View style={styles.links}>
    <Link href="/lista" asChild>
      <Pressable accessibilityRole="link" style={StyleSheet.flatten([styles.menuLink, pathname === '/lista' && styles.activeLink])}>
        <Text style={styles.menuText}>Mi lista</Text>
      </Pressable>
    </Link>
    <Link href="/menu" asChild>
      <Pressable accessibilityRole="link" style={StyleSheet.flatten([styles.menuLink, pathname === '/menu' && styles.activeLink])}>
        <Text style={styles.menuText}>Mi menú</Text>
      </Pressable>
    </Link>
    <Link href="/recetas" asChild>
      <Pressable accessibilityRole="link" style={StyleSheet.flatten([styles.menuLink, pathname === '/recetas' && styles.activeLink])}>
        <Text style={styles.menuText}>Mi Recetas</Text>
      </Pressable>
    </Link>
    <Link href={accountPage ? '/lista' : '/login'} asChild>
      <Pressable accessibilityRole="link" style={styles.button}>
        <Text style={styles.buttonText}>{accountPage ? 'Volver a la lista' : user ? 'Mi cuenta' : 'Iniciar sesión'}</Text>
      </Pressable>
    </Link>
    </View>
  </View>;
}
const styles = StyleSheet.create({
  header: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 12, paddingBottom: 24, borderBottomWidth: 1, borderBottomColor: '#FFFFFF55' },
  links: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 },
  menuLink: { minHeight: 48, paddingHorizontal: 12, justifyContent: 'center' },
  activeLink: { backgroundColor: '#FFFFFF55', borderRadius: 14 },
  menuText: { fontSize: 14, fontWeight: '700', color: colors.ink },
  logo: { fontSize: 28, fontWeight: '800', letterSpacing: -1.2, color: colors.surface }, accent: { color: colors.accent },
  button: { minHeight: 48, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 14, backgroundColor: colors.accent, justifyContent: 'center' },
  buttonText: { fontSize: 14, fontWeight: '700', color: colors.ink },
});
