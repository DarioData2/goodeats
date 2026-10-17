import { Link, usePathname } from 'expo-router';
import { Platform, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import type { User } from '@supabase/supabase-js';
import { colors, ui } from '../constants/theme';

export function AppHeader({ user, accountPage = false }: { user: User | null; accountPage?: boolean }) {
  const pathname = usePathname();
  const compact = useWindowDimensions().width < 650;
  const navigation = [{ href: '/lista', label: 'Mi lista' }, { href: '/menu', label: 'Mi menú' }, { href: '/recetas', label: 'Mis recetas' }] as const;
  const links = <View style={[styles.links, compact ? { width: '100%' } : styles.desktopLinks]}>
    {navigation.map(item => { const active = pathname === item.href; const web = Platform.OS === 'web' ? { 'aria-current': active ? 'page' : undefined } : {}; return <Link key={item.href} href={item.href} asChild>
      <Pressable {...web} accessibilityRole="link" accessibilityLabel={item.label} accessibilityState={{ selected: active }} style={StyleSheet.flatten([styles.menuLink, compact && { flex: 1 }, active && styles.activeLink])}>
        <Text style={[styles.menuText, active && styles.activeText]}>{item.label}</Text>
      </Pressable>
    </Link>; })}
  </View>;
  return <View style={styles.header}>
    <View style={styles.brandRow}>
    <Link href="/" accessibilityLabel="GoodEats: ir al inicio">
      <Text style={styles.logo}>Good<Text style={styles.logoEnd}>Eats</Text></Text>
    </Link>
    {!compact && links}
    <Link href={accountPage ? '/lista' : '/login'} asChild>
      <Pressable accessibilityRole="link" accessibilityLabel={accountPage ? 'Volver a la lista' : user ? 'Mi cuenta' : 'Iniciar sesión'} style={styles.button}>
        <Text style={styles.buttonText}>{accountPage ? 'Volver' : user ? 'Mi cuenta' : 'Entrar'}</Text>
      </Pressable>
    </Link>
    </View>
    {compact && links}
  </View>;
}
const styles = StyleSheet.create({
  header: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 12, paddingBottom: 24, borderBottomWidth: 1, borderBottomColor: colors.border },
  brandRow: { width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 20 },
  links: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 4, maxWidth: '100%', flexShrink: 1 },
  desktopLinks: { flex: 1, justifyContent: 'flex-end' },
  menuLink: { minHeight: 48, paddingHorizontal: 8, justifyContent: 'center', alignItems: 'center' },
  activeLink: { backgroundColor: colors.primarySoft, borderRadius: ui.radius.control },
  menuText: { fontSize: 14, fontWeight: '700', color: colors.ink },
  activeText: { color: colors.primary },
  logo: { fontSize: 28, fontWeight: '800', letterSpacing: -1.2, color: colors.primary }, logoEnd: { color: colors.accent },
  button: { minHeight: 48, paddingHorizontal: 16, paddingVertical: 12, borderRadius: ui.radius.control, backgroundColor: colors.primary, justifyContent: 'center' },
  buttonText: { fontSize: 14, fontWeight: '700', color: colors.onPrimary },
});
