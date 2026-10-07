import { StyleSheet, Text, View } from 'react-native';
import type { LocalShoppingItem as Item } from '../types/shopping';
import { ShoppingItem } from './ShoppingItem';
import { colors } from '../constants/theme';
type Props = { items: Item[]; disabled: boolean; onToggle: (id: string) => void; onEdit: (item: Item) => void; onDelete: (id: string) => void };
export function ShoppingList({ items, disabled, onToggle, onEdit, onDelete }: Props) {
  if (!items.length) return <View style={styles.empty}>
    <Text style={styles.symbol}>＋</Text><Text style={styles.title}>Tu próxima compra empieza aquí</Text>
    <Text style={styles.text}>Agrega tu primer producto y lleva todo lo que necesitas en una sola lista.</Text>
  </View>;
  return <View style={styles.list}>{items.map((item, index) => <View key={item.id} style={index > 0 ? styles.separator : undefined}>
    <ShoppingItem item={item} disabled={disabled} onToggle={() => onToggle(item.id)} onEdit={() => onEdit(item)} onDelete={() => onDelete(item.id)} />
  </View>)}</View>;
}
const styles = StyleSheet.create({
  list: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 18, overflow: 'hidden' },
  separator: { borderTopWidth: 1, borderTopColor: colors.border },
  empty: { backgroundColor: colors.surface, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.border, borderRadius: 24, padding: 32, alignItems: 'center', gap: 14 },
  symbol: { fontSize: 32, color: colors.ink, backgroundColor: colors.accent, width: 64, height: 64, textAlign: 'center', lineHeight: 64, borderRadius: 20 },
  title: { color: colors.ink, fontSize: 19, fontWeight: '600', textAlign: 'center' }, text: { color: colors.muted, fontSize: 15, lineHeight: 23, textAlign: 'center', maxWidth: 340 },
});
