import { Platform, StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import { colors, ui } from '../constants/theme';
import { useEffect, useRef } from 'react';

export function RecipeField({ label, fieldId, error, focusSignal, ...props }: TextInputProps & { label: string; fieldId: string; error?: string; focusSignal?: object }) {
  const inputRef = useRef<TextInput>(null);
  useEffect(() => { if (focusSignal) inputRef.current?.focus(); }, [focusSignal]);
  const errorId = `${fieldId}-error`;
  const web = Platform.OS === 'web' ? { 'aria-invalid': !!error, 'aria-describedby': error ? errorId : undefined } : {};
  return <View style={styles.field}>
    <Text style={styles.label}>{label}</Text>
    <TextInput {...props} {...web} ref={inputRef} nativeID={fieldId} accessibilityLabel={props.accessibilityLabel ?? label} accessibilityHint={error} style={[styles.input, props.multiline && styles.multiline, props.style, error && styles.invalid]} placeholderTextColor={colors.muted} />
    {!!error && <Text nativeID={errorId} style={styles.error}>{error}</Text>}
  </View>;
}
const styles = StyleSheet.create({
  field: { gap: 6 }, label: { color: colors.ink, fontSize: 15, fontWeight: '700' },
  input: { minHeight: 48, padding: 12, color: colors.ink, fontSize: 16, backgroundColor: colors.input, borderWidth: 1, borderColor: colors.controlBorder, borderRadius: ui.radius.control },
  multiline: { minHeight: 140, textAlignVertical: 'top' }, invalid: { borderColor: colors.danger, borderWidth: 2 }, error: { color: colors.danger, fontSize: 14, lineHeight: 20 },
});
