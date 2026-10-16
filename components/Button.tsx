import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, ui } from '../constants/theme';
type Props = { label: string; onPress: () => void; disabled?: boolean; secondary?: boolean; accessibilityLabel?: string };
export function Button({ label, onPress, disabled, secondary, accessibilityLabel }: Props) {
  return <Pressable accessibilityRole="button" accessibilityLabel={accessibilityLabel ?? label} accessibilityState={{ disabled: !!disabled }} onPress={onPress} disabled={disabled}
    style={({ pressed }) => [styles.button, secondary && styles.secondary, disabled && styles.disabled, pressed && !disabled && { opacity: 0.85 }]}>
    <Text style={[styles.text, secondary && styles.secondaryText, disabled && styles.disabledText]}>{label}</Text>
  </Pressable>;
}
const styles = StyleSheet.create({
  button: { minHeight: 48, paddingHorizontal: 18, paddingVertical: 13, borderRadius: ui.radius.control, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  secondary: { backgroundColor: colors.primarySoft }, secondaryText: { color: colors.primary },
  disabled: { backgroundColor: colors.disabled }, disabledText: { color: colors.onDisabled },
  text: { color: colors.onPrimary, fontWeight: '700', fontSize: 15 },
});
