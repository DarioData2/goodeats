import { Pressable, StyleSheet, Text } from 'react-native';
import { colors } from '../constants/theme';
type Props = { label: string; onPress: () => void; disabled?: boolean; secondary?: boolean };
export function Button({ label, onPress, disabled, secondary }: Props) {
  return <Pressable accessibilityRole="button" accessibilityState={{ disabled: !!disabled }} onPress={onPress} disabled={disabled}
    style={({ pressed }) => [styles.button, secondary && styles.secondary, pressed && { opacity: 0.75 }]}>
    <Text style={[styles.text, disabled && { color: colors.muted }]}>{label}</Text>
  </Pressable>;
}
const styles = StyleSheet.create({
  button: { minHeight: 48, paddingHorizontal: 18, paddingVertical: 13, borderRadius: 14, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  secondary: { backgroundColor: colors.accent }, text: { color: colors.onPrimary, fontWeight: '700', fontSize: 15 },
});
