import { Link, usePathname } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { User } from '@supabase/supabase-js';
import { colors, ui } from '../constants/theme';

export function AppHeader({ user, accountPage = false }: { user: User | null; accountPage?: boolean }) {
  const pathname = usePathname();
  return <View style={styles.header}>
    <Link href="/" accessibilityLabel="GoodEats: ir al inicio">
      <Text style={styles.logo}>Good<Text style={styles.logoEnd}>Eats</Text></Text>
    </Link>
    <View style={styles.links}>
    <Link href="/lista" asChild>
      <Pressable accessibilityRole="link" accessibilityLabel="Mi lista" accessibilityState={{ selected: pathname === '/lista' }} style={StyleSheet.flatten([styles.menuLink, pathname === '/lista' && styles.activeLink])}>
        <Text style={[styles.menuText, pathname === '/lista' && styles.activeText]}>{pathname === '/lista' ? '• Mi lista' : 'Mi lista'}</Text>
      </Pressable>
    </Link>
    <Link href="/menu" asChild>
      <Pressable accessibilityRole="link" accessibilityLabel="Mi menú" accessibilityState={{ selected: pathname === '/menu' }} style={StyleSheet.flatten([styles.menuLink, pathname === '/menu' && styles.activeLink])}>
        <Text style={[styles.menuText, pathname === '/menu' && styles.activeText]}>{pathname === '/menu' ? '• Mi menú' : 'Mi menú'}</Text>
      </Pressable>
    </Link>
    <Link href="/recetas" asChild>
      <Pressable accessibilityRole="link" accessibilityLabel="Mi Recetas" accessibilityState={{ selected: pathname === '/recetas' }} style={StyleSheet.flatten([styles.menuLink, pathname === '/recetas' && styles.activeLink])}>
        <Text style={[styles.menuText, pathname === '/recetas' && styles.activeText]}>{pathname === '/recetas' ? '• Mi Recetas' : 'Mi Recetas'}</Text>
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
  header: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 12, paddingBottom: 24, borderBottomWidth: 1, borderBottomColor: colors.border },
  links: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8, maxWidth: '100%', flexShrink: 1 },
  menuLink: { minHeight: 48, paddingHorizontal: 12, justifyContent: 'center' },
  activeLink: { backgroundColor: colors.primarySoft, borderRadius: ui.radius.control },
  menuText: { fontSize: 14, fontWeight: '700', color: colors.ink },
  activeText: { color: colors.primary },
  logo: { fontSize: 28, fontWeight: '800', letterSpacing: -1.2, color: colors.primary }, logoEnd: { color: colors.accent },
  button: { minHeight: 48, paddingHorizontal: 16, paddingVertical: 12, borderRadius: ui.radius.control, backgroundColor: colors.primary, justifyContent: 'center' },
  buttonText: { fontSize: 14, fontWeight: '700', color: colors.onPrimary },
});
