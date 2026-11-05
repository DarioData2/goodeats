import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ActionIcon } from './ActionIcon';
import type { LocalShoppingItem as Item } from '../types/shopping';
import { ui } from '../constants/theme';
import { createThemedStyles } from '../contexts/ThemeContext';
import { formatQuantity } from '../services/quantities';
import { IngredientIcon } from './IngredientIcon';
type Props = { item: Item; disabled: boolean; onToggle: () => void; onEdit: () => void; onDelete: () => void };
export function ShoppingItem({ item, disabled, onToggle, onEdit, onDelete }: Props) {
  const { colors, styles } = useStyles();
  const details = [item.quantity === undefined ? undefined : formatQuantity(item.quantity), item.unit].filter(Boolean).join(' ');
  return <View style={[styles.row, item.purchased && styles.purchased]}>
    <Pressable accessibilityRole="checkbox" accessibilityLabel={`Marcar ${item.name} como ${item.purchased ? 'pendiente' : 'comprado'}`}
      aria-checked={item.purchased} accessibilityState={{ checked: item.purchased, disabled }} onPress={onToggle} disabled={disabled} style={styles.checkTarget}>
      <View style={[styles.checkbox, item.purchased && styles.checked]}><Text style={styles.checkText}>{item.purchased ? '✓' : ''}</Text></View>
    </Pressable>
    <IngredientIcon name={item.name} />
    <View style={styles.description}>
      <Text style={[styles.name, item.purchased && styles.strike]}>{item.name}</Text>
      {!!details && <Text style={styles.details}>{details}</Text>}
    </View>
    <View style={styles.actions}>
      <Pressable accessibilityRole="button" accessibilityLabel={`Editar ${item.name}`} accessibilityState={{ disabled }} disabled={disabled} onPress={onEdit}
        style={({ pressed }) => [styles.action, (pressed || disabled) && { opacity: 0.5 }]}>
        <ActionIcon name="edit" color={colors.primaryDark} />
      </Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel={`Eliminar ${item.name}`} accessibilityState={{ disabled }} disabled={disabled} onPress={onDelete}
        style={({ pressed }) => [styles.action, (pressed || disabled) && { opacity: 0.5 }]}>
        <ActionIcon name="delete" color={colors.danger} />
      </Pressable>
    </View>
  </View>;
}
const useStyles = createThemedStyles(colors => StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, backgroundColor: colors.surface, gap: 6 },
  purchased: { backgroundColor: colors.primarySoft }, checkTarget: { width: 44, minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  checkbox: { width: 25, height: 25, borderWidth: 1.5, borderColor: colors.controlBorder, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  checked: { backgroundColor: colors.primaryDark, borderColor: colors.primaryDark }, checkText: { color: colors.onPrimary, fontSize: 17, fontWeight: '700' },
  description: { flex: 1, minWidth: 0, gap: 2 }, name: { color: colors.ink, fontSize: 16, fontWeight: '600' },
  strike: { textDecorationLine: 'line-through', color: colors.muted }, details: { color: colors.muted, fontSize: 13 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 2 }, action: { width: 44, minHeight: 44, justifyContent: 'center', alignItems: 'center', borderRadius: ui.radius.control },
}));
