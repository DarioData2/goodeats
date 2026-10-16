import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, ui } from '../constants/theme';
import { Button } from './Button';
import { Heading } from './Heading';

export type SelectProps = { label: string; values: readonly string[]; value: string; onChange: (value: string) => void; disabled?: boolean };
export function CompactSelect({ label, values, value, onChange, disabled }: SelectProps) {
  const [open, setOpen] = useState(false);
  return <View style={{ gap: 6 }}>
    <Text style={styles.label}>{label}</Text>
    <Pressable accessibilityRole="button" accessibilityLabel={`${label}: ${value}`} aria-expanded={open} disabled={disabled} onPress={() => setOpen(true)} style={styles.control}>
      <Text style={styles.text}>{value} ▾</Text>
    </Pressable>
    <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
      <View style={styles.backdrop}><View style={styles.panel} accessibilityViewIsModal>
        <Heading level={2} style={styles.label}>{label}</Heading>
        <ScrollView><View accessibilityRole="radiogroup" accessibilityLabel={label}>{values.map(option => <Pressable key={option} accessibilityRole="radio" accessibilityState={{ checked: option === value }} onPress={() => { onChange(option); setOpen(false); }} style={styles.control}><Text style={styles.text}>{option === value ? '✓ ' : ''}{option}</Text></Pressable>)}</View></ScrollView>
        <Button secondary label="Cerrar opciones" onPress={() => setOpen(false)} />
      </View></View>
    </Modal>
  </View>;
}
const styles = StyleSheet.create({
  label: { color: colors.ink, fontSize: 15, fontWeight: '700' }, text: { color: colors.ink, fontSize: 16 },
  control: { minHeight: 48, justifyContent: 'center', borderWidth: 1, borderColor: colors.controlBorder, borderRadius: ui.radius.control, backgroundColor: colors.surface, padding: 12, marginBottom: 4 },
  backdrop: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: colors.overlay },
  panel: { maxHeight: '80%', borderRadius: ui.radius.card, backgroundColor: colors.surface, padding: 20, gap: 16 },
});
