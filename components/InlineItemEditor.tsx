import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, ui } from '../constants/theme';
import { UNITS } from '../constants/units';
import { parseItemInput } from '../services/shoppingLogic';
import type { LocalShoppingItem, ShoppingItemInput } from '../types/shopping';
import { Button } from './Button';
import { CompactSelect } from './CompactSelect';
import { RecipeField } from './RecipeField';

type Props = {
  item: LocalShoppingItem; disabled: boolean;
  onSave: (input: ShoppingItemInput) => Promise<boolean>; onCancel: () => void;
};
export function InlineItemEditor({ item, disabled, onSave, onCancel }: Props) {
  const [name, setName] = useState(item.name);
  const [quantity, setQuantity] = useState(item.quantity?.toString() ?? '');
  const [unit, setUnit] = useState(item.unit ?? 'unidad');
  const [error, setError] = useState<string | null>(null);
  const [invalidField, setInvalidField] = useState<'name' | 'quantity'>('name');
  const [focusSignal, setFocusSignal] = useState<object>();
  async function save() {
    if (disabled) return;
    let input: ShoppingItemInput;
    try { input = parseItemInput(name, quantity, unit); setError(null); }
    catch (issue) { setError((issue as Error).message); setInvalidField(name.trim() ? 'quantity' : 'name'); setFocusSignal({}); return; }
    await onSave(input);
  }
  return <View style={styles.editor}>
    <RecipeField label="Producto" fieldId={`item-${item.id}-name`} error={invalidField === 'name' ? error ?? undefined : undefined} focusSignal={invalidField === 'name' ? focusSignal : undefined} accessibilityLabel={`Nombre de ${item.name}`} value={name} onChangeText={setName}
      editable={!disabled} maxLength={120} style={styles.input} />
    <RecipeField label="Cantidad (opcional)" fieldId={`item-${item.id}-quantity`} error={invalidField === 'quantity' ? error ?? undefined : undefined} focusSignal={invalidField === 'quantity' ? focusSignal : undefined} accessibilityLabel={`Cantidad de ${item.name}`} value={quantity} onChangeText={setQuantity}
      editable={!disabled} keyboardType="decimal-pad" placeholder="Ej. 6" placeholderTextColor={colors.muted}
      maxLength={20} style={styles.input} />
    <CompactSelect label={`Unidad de ${item.name}`} values={UNITS} value={unit} onChange={setUnit} disabled={disabled} />
    {error && <Text accessibilityRole="alert" style={styles.error}>Revisa el campo indicado.</Text>}
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
