import { Link, usePathname } from 'expo-router';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { ui } from '../constants/theme';
import { createThemedStyles } from '../contexts/ThemeContext';

const destinations = [
  { href: '/lista', label: 'Mi lista', path: 'M8 4h12v17H4V4h4M9 2h6v4H9zM8 11h8M8 16h6' },
  { href: '/menu', label: 'Mi menú', path: 'M4 5h16v16H4zM8 2v6M16 2v6M4 10h16M8 14h2M14 14h2M8 18h2' },
  { href: '/recetas', label: 'Mis recetas', path: 'M12 5C9 3 5 3 2 4v16c3-1 7-1 10 1m0-16c3-2 7-2 10-1v16c-3-1-7-1-10 1V5zM5 8h4M5 12h4M15 8h4M15 12h4' },
  { href: '/hidratacion', label: 'Mi salud', path: 'M12 2C9 7 5 10 5 15a7 7 0 0 0 14 0c0-5-4-8-7-13ZM8 15a4 4 0 0 0 4 4' },
] as const;

export function BottomNavigation() {
  const { colors, styles } = useStyles();
  const pathname = usePathname();
  const landmark = Platform.OS === 'web' ? { role: 'navigation' as const } : {};
  return <SafeAreaView edges={['bottom', 'left', 'right']} style={styles.surface}>
    <View {...landmark} accessibilityLabel="Navegación principal" style={styles.bar}>
      {destinations.map(item => {
        const active = pathname === item.href;
        const web = Platform.OS === 'web' ? { 'aria-current': active ? 'page' as const : undefined } : {};
        return <Link key={item.href} href={item.href} asChild>
          <Pressable {...web} accessibilityRole="link" accessibilityLabel={item.label} accessibilityState={{ selected: active }} style={StyleSheet.flatten([styles.link, active && styles.active])}>
            <View accessible={false} aria-hidden={true}>
              <Svg width={23} height={23} viewBox="0 0 24 24" fill="none" stroke={active ? colors.primary : colors.muted} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><Path d={item.path} /></Svg>
            </View>
            <Text style={[styles.label, active && styles.activeLabel]}>{item.label}</Text>
          </Pressable>
        </Link>;
      })}
    </View>
  </SafeAreaView>;
}

const useStyles = createThemedStyles(colors => StyleSheet.create({
  surface: { backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border, flexShrink: 0 },
  bar: { width: '100%', maxWidth: 1080, alignSelf: 'center', flexDirection: 'row', paddingHorizontal: 8, paddingVertical: 6, gap: 4 },
  link: { flex: 1, minHeight: 64, alignItems: 'center', justifyContent: 'center', gap: 5, paddingVertical: 8, paddingHorizontal: 4, borderRadius: ui.radius.control, borderTopWidth: 2, borderTopColor: colors.transparent },
  active: { backgroundColor: colors.primarySoft, borderTopColor: colors.primary },
  label: { color: colors.muted, fontSize: 12, fontWeight: '600', textAlign: 'center' },
  activeLabel: { color: colors.primary, fontWeight: '800' },
}));
