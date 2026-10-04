import { useRef, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AddItemForm } from '../components/AddItemForm';
import { ShoppingList } from '../components/ShoppingList';
import { Button } from '../components/Button';
import { colors } from '../constants/theme';
import { useShoppingList } from '../hooks/useShoppingList';
import type { ShoppingItem, ShoppingItemInput } from '../types/shopping';
export default function ShoppingScreen() {
  const list = useShoppingList();
  const [editing, setEditing] = useState<ShoppingItem | null>(null);
  const scroll = useRef<ScrollView>(null);
  const wide = useWindowDimensions().width >= 850;
  const purchased = list.items.filter(item => item.purchased).length;
  const disabled = list.loading || list.saving || !list.ready;
  async function submit(input: ShoppingItemInput) {
    const saved = editing ? await list.edit(editing.id, input) : await list.add(input);
    if (saved) setEditing(null);
    return saved;
  }
  return <SafeAreaView style={styles.safe}>
    <KeyboardAvoidingView style={styles.safe} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView ref={scroll} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scroll}>
        <View style={styles.container}>
          <View style={styles.brandRow}><Text style={styles.logo}>G<Text style={{ color: colors.accent }}>oo</Text>dEats<Text style={{ color: colors.accent }}> ·</Text></Text>
            <Text style={styles.brandNote}>MENOS OLVIDOS. MÁS ORDEN.</Text></View>
          <View style={styles.intro}><Text style={styles.kicker}>TU COCINA, ORGANIZADA</Text>
            <Text style={[styles.heading, !wide && { fontSize: 34 }]}>Mi lista de compras</Text>
            <Text style={styles.subtitle}>Todo lo que necesitas, a mano.</Text></View>
          {list.error && <View style={styles.errorBox}><Text accessibilityRole="alert" style={styles.error}>{list.error}</Text>
            {!list.ready && <Button label="Volver a cargar" secondary disabled={list.loading} onPress={() => void list.reload()} />}</View>}
          <View style={[styles.columns, wide && styles.wide]}>
            <View style={wide ? styles.formColumn : undefined}><AddItemForm key={editing?.id ?? 'new'} editing={editing} disabled={disabled} saving={list.saving}
              onSubmit={submit} onCancel={() => setEditing(null)} /></View>
            <View style={styles.listColumn}>
              <View style={styles.listHeader}><Text style={styles.listTitle}>Tu lista</Text><Text style={styles.count}>{list.items.length} {list.items.length === 1 ? 'producto' : 'productos'}</Text></View>
              <View style={styles.summary}><Text style={styles.pending}>{list.items.length - purchased} pendientes</Text>
                <Text style={styles.count}>{purchased} {purchased === 1 ? 'comprado' : 'comprados'}</Text></View>
              {list.loading ? <ActivityIndicator accessibilityLabel="Cargando lista" color={colors.primaryDark} style={{ padding: 40 }} /> :
                list.ready && <ShoppingList items={list.items} disabled={disabled} onToggle={id => { void list.toggle(id); }}
                  onEdit={item => { setEditing(item); scroll.current?.scrollTo({ y: 0, animated: true }); }}
                  onDelete={id => { void list.remove(id).then(saved => { if (saved && editing?.id === id) setEditing(null); }); }} />}
              <View style={styles.footer}>
                <Text accessibilityLiveRegion="polite" style={styles.localNote}>{list.saving ? 'Guardando cambios…' : list.ready ? 'Guardado en este dispositivo' : 'Almacenamiento local'}</Text>
                <Button label="Limpiar comprados" secondary disabled={disabled || purchased === 0}
                  onPress={() => { void list.clearPurchased().then(saved => { if (saved && editing && list.items.find(item => item.id === editing.id)?.purchased) setEditing(null); }); }} />
              </View>
            </View>
          </View>
          <Text style={styles.bottom}>Buenas comidas empiezan con una buena lista.</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  </SafeAreaView>;
}
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background }, scroll: { flexGrow: 1, paddingHorizontal: 20, paddingVertical: 24 },
  container: { width: '100%', maxWidth: 1080, alignSelf: 'center' },
  brandRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 12, paddingBottom: 24, borderBottomWidth: 1, borderBottomColor: '#FFFFFF55' },
  logo: { fontSize: 28, fontWeight: '800', letterSpacing: -1.2, color: colors.surface }, brandNote: { fontSize: 10, fontWeight: '600', letterSpacing: 1.5, color: colors.ink },
  intro: { paddingVertical: 32, gap: 10 }, kicker: { fontSize: 11, fontWeight: '700', letterSpacing: 2, color: colors.ink },
  heading: { fontSize: 44, fontWeight: '700', letterSpacing: -1.4, color: colors.surface }, subtitle: { fontSize: 16, color: colors.ink },
  columns: { gap: 28 }, wide: { flexDirection: 'row', alignItems: 'flex-start' }, formColumn: { width: 340 }, listColumn: { flex: 1, gap: 16 },
  listHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 }, listTitle: { fontSize: 24, fontWeight: '700', color: colors.surface },
  count: { fontSize: 13, color: colors.ink }, summary: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: colors.accent, padding: 16, borderRadius: 14, gap: 10 },
  pending: { fontSize: 13, fontWeight: '600', color: colors.ink }, footer: { gap: 14, marginTop: 4 }, localNote: { color: colors.ink, fontSize: 12 },
  bottom: { color: colors.ink, fontSize: 12, textAlign: 'center', marginTop: 40, marginBottom: 12 },
  errorBox: { padding: 16, backgroundColor: colors.errorBackground, borderRadius: 14, marginBottom: 20, gap: 12 }, error: { color: colors.danger, lineHeight: 22 },
});
