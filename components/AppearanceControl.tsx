import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { createThemedStyles, useTheme } from '../contexts/ThemeContext';
import { ui } from '../constants/theme';
import { Heading } from './Heading';

export function AppearanceControl() {
  const { mode, ready, busy, error, toggle } = useTheme();
  const { colors, styles } = useStyles();
  const dark = mode === 'dark';
  return <View style={styles.card}>
    <Heading level={2} style={styles.title}>Apariencia</Heading>
    <Pressable accessibilityRole="button" accessibilityLabel="Modo oscuro" aria-pressed={dark}
      accessibilityState={{ selected: dark, disabled: !ready || busy }} disabled={!ready || busy}
      onPress={() => void toggle()} style={styles.control}>
      <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={colors.primary} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        {dark ? <Path d="M20 14A8 8 0 0 1 10 4a8 8 0 1 0 10 10Z" /> : <><Circle cx={12} cy={12} r={4} /><Path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" /></>}
      </Svg>
      <View style={styles.copy}><Text style={styles.label}>Modo oscuro</Text><Text style={styles.note}>{busy ? 'Guardando…' : dark ? 'Activado' : 'Desactivado'}</Text></View>
      <View accessible={false} style={[styles.track, dark && styles.activeTrack]}><View style={[styles.thumb, dark && styles.activeThumb]} /></View>
    </Pressable>
    <Text style={styles.note}>Tu preferencia se guarda en este dispositivo.</Text>
    {!!error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
  </View>;
}
const useStyles = createThemedStyles(colors => StyleSheet.create({
  card: { borderRadius: ui.radius.card, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, padding: 20, gap: 12, marginBottom: 16 },
  title: { color: colors.ink, fontWeight: '700', fontSize: 18 },
  control: { minHeight: 56, flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: ui.radius.control, paddingVertical: 8 },
  copy: { flex: 1 }, label: { color: colors.ink, fontSize: 16, fontWeight: '600' }, note: { color: colors.muted, fontSize: 13, lineHeight: 20 },
  track: { width: 48, height: 28, borderRadius: 14, padding: 3, backgroundColor: colors.controlBorder }, activeTrack: { backgroundColor: colors.primary },
  thumb: { height: 22, width: 22, borderRadius: 11, backgroundColor: colors.surface }, activeThumb: { alignSelf: 'flex-end', backgroundColor: colors.onPrimary },
  error: { color: colors.danger, lineHeight: 22 },
}));
