import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { LocalShoppingItem as ShoppingItem, ShoppingItemInput } from '../types/shopping';
import { UNITS } from '../constants/units';
import { ui } from '../constants/theme';
import { createThemedStyles } from '../contexts/ThemeContext';
import { parseItemInput } from '../services/shoppingLogic';
import { Button } from './Button';
import { CompactSelect } from './CompactSelect';
import { Heading } from './Heading';
import { RecipeField } from './RecipeField';
type Props = {
  editing: ShoppingItem | null; disabled: boolean; saving: boolean;
  onSubmit: (input: ShoppingItemInput) => Promise<boolean>; onCancel: () => void;
};
export function AddItemForm({ editing, disabled, saving, onSubmit, onCancel }: Props) {
  const { styles } = useStyles();
  const [name, setName] = useState(editing?.name ?? '');
  const [quantity, setQuantity] = useState(editing?.quantity?.toString() ?? '');
  const [unit, setUnit] = useState<string>(editing?.unit ?? 'unidad');
  const [error, setError] = useState<string | null>(null);
  const [invalidField, setInvalidField] = useState<'name' | 'quantity'>('name');
  const [focusSignal, setFocusSignal] = useState<object>();
  async function submit() {
    if (disabled) return;
    let input: ShoppingItemInput;
    try { input = parseItemInput(name, quantity, unit); setError(null); }
    catch (issue) { setError((issue as Error).message); setInvalidField(name.trim() ? 'quantity' : 'name'); setFocusSignal({}); return; }
    if (await onSubmit(input)) { setName(''); setQuantity(''); setUnit('unidad'); }
  }
  return <View style={styles.card}>
    <Text style={styles.eyebrow}>{editing ? 'AJUSTA TU LISTA' : '¿QUÉ HACE FALTA?'}</Text>
    <Heading level={2} style={styles.title}>{editing ? 'Editar producto' : 'Agregar producto'}</Heading>
    <RecipeField label="Producto" fieldId="new-item-name" error={invalidField === 'name' ? error ?? undefined : undefined} focusSignal={invalidField === 'name' ? focusSignal : undefined} placeholder="Ej. Tomates"
      value={name} onChangeText={setName} editable={!disabled} style={styles.input} maxLength={120}
      returnKeyType="done" onSubmitEditing={() => void submit()} />
    <RecipeField label="Cantidad (opcional)" fieldId="new-item-quantity" error={invalidField === 'quantity' ? error ?? undefined : undefined} focusSignal={invalidField === 'quantity' ? focusSignal : undefined} placeholder="Ej. 6"
      keyboardType="decimal-pad" value={quantity} onChangeText={setQuantity} editable={!disabled} style={styles.input} maxLength={20} />
    <CompactSelect label="Unidad" values={UNITS} value={unit} onChange={setUnit} disabled={disabled} />
    {error && <Text accessibilityRole="alert" style={styles.error}>Revisa el campo indicado.</Text>}
    <Button label={saving ? 'Guardando…' : editing ? 'Guardar cambios' : '+  Agregar a la lista'} disabled={disabled} onPress={() => void submit()} />
    {editing && <Button label="Cancelar edición" secondary disabled={saving} onPress={onCancel} />}
    <Text style={styles.hint}>Una cosa menos en qué pensar.</Text>
  </View>;
}
const useStyles = createThemedStyles(colors => StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: ui.radius.card, padding: 24, borderWidth: 1, borderColor: colors.border, gap: 12 },
  eyebrow: { fontSize: 11, letterSpacing: 1.5, fontWeight: '700', color: colors.primaryDark },
  title: { color: colors.ink, fontSize: 23, fontWeight: '700', marginBottom: 8 },
  label: { fontSize: 14, fontWeight: '600', color: colors.ink, marginTop: 4 }, optional: { fontWeight: '400', color: colors.muted },
  input: { minHeight: 50, borderWidth: 1, borderColor: colors.controlBorder, borderRadius: ui.radius.control, padding: 14, fontSize: 16, color: colors.ink, backgroundColor: colors.input },
  units: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  chip: { borderWidth: 1, borderColor: colors.controlBorder, minHeight: 44, paddingHorizontal: 13, justifyContent: 'center', borderRadius: ui.radius.control },
  selected: { backgroundColor: colors.primary, borderColor: colors.primary }, chipText: { fontSize: 14, color: colors.muted },
  error: { color: colors.danger, fontSize: 14 }, hint: { textAlign: 'center', color: colors.muted, fontSize: 12, marginTop: 4 },
}));
