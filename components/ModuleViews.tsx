import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ui } from '../constants/theme';
import { createThemedStyles } from '../contexts/ThemeContext';
export function ModuleViews({ labels, legacy, onChange, disabled }: { labels: [string, string]; legacy: boolean; onChange: (value: boolean) => void; disabled: boolean }) {
  const { styles } = useStyles();
  return <View style={styles.bar} accessibilityLabel="Vista del módulo">{labels.map((label, index) => {
    const active = legacy === !!index;
    return <Pressable key={label} accessibilityRole="button" accessibilityLabel={label} aria-pressed={active} accessibilityState={{ selected: active, disabled }} disabled={disabled} onPress={() => onChange(!!index)} style={[styles.option, active && styles.active]}><Text style={[styles.label, active && styles.activeLabel]}>{active ? '✓ ' : ''}{label}</Text></Pressable>;
  })}</View>;
}
const useStyles = createThemedStyles(colors => StyleSheet.create({
  bar: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingTop: 20 }, option: { flexGrow: 1, minHeight: 48, justifyContent: 'center', alignItems: 'center', padding: 12, borderRadius: ui.radius.control, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.controlBorder },
  active: { borderColor: colors.primary, backgroundColor: colors.primarySoft }, label: { fontSize: 14, color: colors.ink }, activeLabel: { color: colors.primary, fontWeight: '700' },
}));
