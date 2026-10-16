import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, ui } from '../constants/theme';
import { UNITS } from '../constants/units';
import { parseItemInput } from '../services/shoppingLogic';
import type { LocalShoppingItem, ShoppingItemInput } from '../types/shopping';
import { Button } from './Button';

type Props = {
  item: LocalShoppingItem; disabled: boolean;
  onSave: (input: ShoppingItemInput) => Promise<boolean>; onCancel: () => void;
};
export function InlineItemEditor({ item, disabled, onSave, onCancel }: Props) {
  const [name, setName] = useState(item.name);
  const [quantity, setQuantity] = useState(item.quantity?.toString() ?? '');
  const [unit, setUnit] = useState(item.unit ?? 'unidad');
  const [error, setError] = useState<string | null>(null);
  async function save() {
    if (disabled) return;
    let input: ShoppingItemInput;
    try { input = parseItemInput(name, quantity, unit); setError(null); }
    catch (issue) { setError((issue as Error).message); return; }
    await onSave(input);
  }
  return <View style={styles.editor}>
    <Text style={styles.label}>Producto</Text>
    <TextInput accessibilityLabel={`Nombre de ${item.name}`} value={name} onChangeText={setName}
      editable={!disabled} maxLength={120} style={styles.input} />
    <Text style={styles.label}>Cantidad (opcional)</Text>
    <TextInput accessibilityLabel={`Cantidad de ${item.name}`} value={quantity} onChangeText={setQuantity}
      editable={!disabled} keyboardType="decimal-pad" placeholder="Ej. 6" placeholderTextColor={colors.muted}
      maxLength={20} style={styles.input} />
    <Text style={styles.label}>Unidad</Text>
    <View style={styles.units}>{UNITS.map(value => <Pressable key={value} accessibilityRole="radio"
      accessibilityLabel={`${value} para ${item.name}`} aria-checked={unit === value} accessibilityState={{ checked: unit === value, disabled }}
      disabled={disabled} onPress={() => setUnit(value)} style={[styles.chip, unit === value && styles.selected]}>
      <Text style={[styles.chipText, unit === value && { color: colors.onPrimary }]}>{unit === value ? '✓ ' : ''}{value}</Text>
    </Pressable>)}</View>
    {error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
    <View style={styles.buttons}>
      <View style={styles.button}><Button label={disabled ? 'Guardando…' : 'Guardar'} disabled={disabled} onPress={() => void save()} /></View>
      <View style={styles.button}><Button label="Cancelar" secondary disabled={disabled} onPress={onCancel} /></View>
    </View>
  </View>;
}
const styles = StyleSheet.create({
  editor: { padding: 14, gap: 8, backgroundColor: colors.primarySoft },
  label: { fontSize: 13, fontWeight: '600', color: colors.ink },
  input: { minHeight: 44, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderColor: colors.controlBorder,
    borderRadius: ui.radius.control, backgroundColor: colors.surface, color: colors.ink, fontSize: 16 },
  units: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { minHeight: 44, paddingHorizontal: 12, justifyContent: 'center', borderRadius: ui.radius.control,
    borderWidth: 1, borderColor: colors.controlBorder, backgroundColor: colors.surface },
  selected: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 14, color: colors.ink },
  buttons: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 }, button: { flex: 1, minWidth: 110 },
  error: { color: colors.danger, fontSize: 14 },
});
