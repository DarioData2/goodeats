import { Link } from 'expo-router';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import type { User } from '@supabase/supabase-js';
import Svg, { Circle, Path } from 'react-native-svg';
import { createThemedStyles } from '../contexts/ThemeContext';
import { useAccount } from '../contexts/AuthContext';
import { profileNames } from '../services/profileLogic';

export function AppHeader({ user, accountPage = false }: { user: User | null; accountPage?: boolean }) {
  const { colors, styles } = useStyles();
  const { user: currentUser, avatarUrl } = useAccount();
  const names = profileNames(user?.user_metadata);
  const photo = user?.id === currentUser?.id ? avatarUrl : null;
  const fullName = [names.firstName, names.lastName].filter(Boolean).join(' ');
  return <View style={styles.header}>
    <View style={styles.brandRow}>
    <Link href="/" accessibilityLabel="GoodEats: ir al inicio">
      <Text style={styles.logo}>Good<Text style={styles.logoEnd}>Eats</Text></Text>
    </Link>
    <Link href={accountPage ? '/lista' : '/login'} asChild>
      <Pressable accessibilityRole="link" accessibilityLabel={accountPage ? 'Volver a la lista' : user ? `Mi cuenta${fullName ? `: ${fullName}` : ''}` : 'Iniciar sesión'} style={styles.button}>
        {photo && !accountPage ? <Image source={{ uri: photo }} accessible={false} style={styles.avatar} /> :
        <View accessible={false} aria-hidden={true}>
          <Svg width={25} height={25} viewBox="0 0 24 24" fill="none" stroke={colors.onAccentIcon} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            {accountPage ? <Path d="M19 12H5m6-6-6 6 6 6" /> : <><Circle cx={12} cy={8} r={4} /><Path d="M4 21v-2a8 8 0 0 1 16 0v2" /></>}
          </Svg>
        </View>}
      </Pressable>
    </Link>
    </View>
  </View>;
}
const useStyles = createThemedStyles(colors => StyleSheet.create({
  header: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 12, paddingBottom: 24, borderBottomWidth: 1, borderBottomColor: colors.border },
  brandRow: { width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 20 },
  logo: { fontSize: 28, fontWeight: '800', letterSpacing: -1.2, color: colors.primary }, logoEnd: { color: colors.accent },
  button: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.accent, justifyContent: 'center', alignItems: 'center' },
  avatar: { width: 48, height: 48, borderRadius: 24 },
}));
