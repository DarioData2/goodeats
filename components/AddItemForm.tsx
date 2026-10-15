import { useState } from 'react';
import { StyleSheet, Text, TextInput, View, Pressable } from 'react-native';
import type { LocalShoppingItem as ShoppingItem, ShoppingItemInput } from '../types/shopping';
import { UNITS } from '../constants/units';
import { colors, ui } from '../constants/theme';
import { parseItemInput } from '../services/shoppingLogic';
import { Button } from './Button';
type Props = {
  editing: ShoppingItem | null; disabled: boolean; saving: boolean;
  onSubmit: (input: ShoppingItemInput) => Promise<boolean>; onCancel: () => void;
};
export function AddItemForm({ editing, disabled, saving, onSubmit, onCancel }: Props) {
  const [name, setName] = useState(editing?.name ?? '');
  const [quantity, setQuantity] = useState(editing?.quantity?.toString() ?? '');
  const [unit, setUnit] = useState<string>(editing?.unit ?? 'unidad');
  const [error, setError] = useState<string | null>(null);
  async function submit() {
    if (disabled) return;
    let input: ShoppingItemInput;
    try { input = parseItemInput(name, quantity, unit); setError(null); }
    catch (issue) { setError((issue as Error).message); return; }
    if (await onSubmit(input)) { setName(''); setQuantity(''); setUnit('unidad'); }
  }
  return <View style={styles.card}>
    <Text style={styles.eyebrow}>{editing ? 'AJUSTA TU LISTA' : '¿QUÉ HACE FALTA?'}</Text>
    <Text style={styles.title}>{editing ? 'Editar producto' : 'Agregar producto'}</Text>
    <Text style={styles.label}>Producto</Text>
    <TextInput accessibilityLabel="Producto" placeholder="Ej. Tomates" placeholderTextColor={colors.muted}
      value={name} onChangeText={setName} editable={!disabled} style={styles.input} maxLength={120}
      returnKeyType="done" onSubmitEditing={() => void submit()} />
    <Text style={styles.label}>Cantidad <Text style={styles.optional}>(opcional)</Text></Text>
    <TextInput accessibilityLabel="Cantidad (opcional)" placeholder="Ej. 6" placeholderTextColor={colors.muted}
      keyboardType="decimal-pad" value={quantity} onChangeText={setQuantity} editable={!disabled} style={styles.input} maxLength={20} />
    <Text style={styles.label}>Unidad</Text>
    <View style={styles.units}>
      {UNITS.map(value => <Pressable key={value} accessibilityRole="radio" accessibilityLabel={value}
        accessibilityState={{ checked: unit === value, disabled }} disabled={disabled} onPress={() => setUnit(value)}
        style={[styles.chip, unit === value && styles.selected]}>
        <Text style={[styles.chipText, unit === value && { color: colors.onPrimary }]}>{unit === value ? '✓ ' : ''}{value}</Text>
      </Pressable>)}
    </View>
    {error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
    <Button label={saving ? 'Guardando…' : editing ? 'Guardar cambios' : '+  Agregar a la lista'} disabled={disabled} onPress={() => void submit()} />
    {editing && <Button label="Cancelar edición" secondary disabled={saving} onPress={onCancel} />}
    <Text style={styles.hint}>Una cosa menos en qué pensar.</Text>
  </View>;
}
const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: ui.radius.card, padding: 24, borderWidth: 1, borderColor: colors.border, gap: 12 },
  eyebrow: { fontSize: 11, letterSpacing: 1.5, fontWeight: '700', color: colors.primaryDark },
  title: { color: colors.ink, fontSize: 23, fontWeight: '700', marginBottom: 8 },
  label: { fontSize: 14, fontWeight: '600', color: colors.ink, marginTop: 4 }, optional: { fontWeight: '400', color: colors.muted },
  input: { minHeight: 50, borderWidth: 1, borderColor: colors.controlBorder, borderRadius: ui.radius.control, padding: 14, fontSize: 16, color: colors.ink, backgroundColor: colors.input },
  units: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  chip: { borderWidth: 1, borderColor: colors.controlBorder, minHeight: 44, paddingHorizontal: 13, justifyContent: 'center', borderRadius: ui.radius.control },
  selected: { backgroundColor: colors.primary, borderColor: colors.primary }, chipText: { fontSize: 14, color: colors.muted },
  error: { color: colors.danger, fontSize: 14 }, hint: { textAlign: 'center', color: colors.muted, fontSize: 12, marginTop: 4 },
});
