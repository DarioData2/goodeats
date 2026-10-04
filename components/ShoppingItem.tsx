import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { LocalShoppingItem as Item } from '../types/shopping';
import { colors } from '../constants/theme';
type Props = { item: Item; disabled: boolean; onToggle: () => void; onEdit: () => void; onDelete: () => void };
export function ShoppingItem({ item, disabled, onToggle, onEdit, onDelete }: Props) {
  const details = [item.quantity?.toLocaleString('es-CL'), item.unit].filter(Boolean).join(' ');
  return <View style={[styles.row, item.purchased && styles.purchased]}>
    <Pressable accessibilityRole="checkbox" accessibilityLabel={`Marcar ${item.name} como ${item.purchased ? 'pendiente' : 'comprado'}`}
      accessibilityState={{ checked: item.purchased, disabled }} onPress={onToggle} disabled={disabled} style={styles.checkTarget}>
      <View style={[styles.checkbox, item.purchased && styles.checked]}><Text style={styles.checkText}>{item.purchased ? '✓' : ''}</Text></View>
    </Pressable>
    <View style={styles.description}>
      <Text style={[styles.name, item.purchased && styles.strike]}>{item.name}</Text>
      {!!details && <Text style={styles.details}>{details}</Text>}
    </View>
    <View style={styles.actions}>
      <Pressable accessibilityRole="button" accessibilityLabel={`Editar ${item.name}`} disabled={disabled} onPress={onEdit} style={styles.action}><Text style={styles.edit}>Editar</Text></Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel={`Eliminar ${item.name}`} disabled={disabled} onPress={onDelete} style={styles.action}><Text style={styles.delete}>Eliminar</Text></Pressable>
    </View>
  </View>;
}
const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', padding: 12, borderWidth: 1, borderColor: colors.border, borderRadius: 16, backgroundColor: colors.surface, gap: 8 },
  purchased: { backgroundColor: colors.primarySoft }, checkTarget: { width: 44, minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  checkbox: { width: 25, height: 25, borderWidth: 1.5, borderColor: colors.controlBorder, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  checked: { backgroundColor: colors.primaryDark, borderColor: colors.primaryDark }, checkText: { color: '#FFFFFF', fontSize: 17, fontWeight: '700' },
  description: { flex: 1, gap: 5 }, name: { color: colors.ink, fontSize: 16, fontWeight: '600' },
  strike: { textDecorationLine: 'line-through', color: colors.muted }, details: { color: colors.muted, fontSize: 13 },
  actions: { alignItems: 'flex-end' }, action: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 8 },
  edit: { color: colors.primaryDark, fontWeight: '600', fontSize: 13 }, delete: { color: colors.danger, fontSize: 13 },
});
