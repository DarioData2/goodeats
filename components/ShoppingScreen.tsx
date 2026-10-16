import { useState, type ReactNode } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AddItemForm } from '../components/AddItemForm';
import { ShoppingList } from '../components/ShoppingList';
import { Button } from '../components/Button';
import { colors, ui } from '../constants/theme';
import { useShoppingList } from '../hooks/useShoppingList';
import { useCloudShoppingList } from '../hooks/useCloudShoppingList';
import { AppHeader } from './AppHeader';
import { Heading } from './Heading';
import { CloudListControls } from '../components/CloudListControls';
import type { User } from '@supabase/supabase-js';
import type { LocalShoppingItem as ShoppingItem, ShoppingItemInput } from '../types/shopping';
export default function ShoppingScreen({ user, toolbar }: { user: User | null; toolbar?: ReactNode }) {
  return user ? <CloudShoppingScreen user={user} toolbar={toolbar} /> : <LocalShoppingScreen toolbar={toolbar} />;
}
function LocalShoppingScreen({ toolbar }: { toolbar?: ReactNode }) {
  const list = useShoppingList();
  return <ShoppingContent list={list} user={null} toolbar={toolbar} />;
}
function CloudShoppingScreen({ user, toolbar }: { user: User; toolbar?: ReactNode }) {
  const list = useCloudShoppingList();
  return <ShoppingContent key={list.selectedId ?? 'no-list'} list={list} cloud={list} user={user} toolbar={toolbar} />;
}
function ShoppingContent({ list, cloud, user, toolbar }: {
  list: ReturnType<typeof useShoppingList>; cloud?: ReturnType<typeof useCloudShoppingList>; user: User | null; toolbar?: ReactNode;
}) {
  const [editing, setEditing] = useState<ShoppingItem | null>(null);
  const wide = useWindowDimensions().width >= 850;
  const purchased = list.items.filter(item => item.purchased).length;
  const disabled = list.loading || list.saving || !list.ready;
  async function submit(input: ShoppingItemInput) {
    return list.add(input);
  }
  return <SafeAreaView style={styles.safe}>
    <KeyboardAvoidingView style={styles.safe} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scroll}>
        <View style={styles.container}>
          <AppHeader user={user} />{toolbar}
          <View style={styles.intro}><Text style={styles.kicker}>TU COCINA, ORGANIZADA</Text>
            <Heading style={[styles.heading, !wide && { fontSize: 34 }]}>Mi lista de compras</Heading>
            <Text style={styles.subtitle}>Todo lo que necesitas, a mano.</Text></View>
          {cloud && <CloudListControls list={cloud} />}
          {list.error && <View style={styles.errorBox}><Text accessibilityRole="alert" style={styles.error}>{list.error}</Text>
            {!list.ready && <Button label="Volver a cargar" secondary disabled={list.loading} onPress={() => void list.reload()} />}</View>}
          <View style={[styles.columns, wide && styles.wide]}>
            <View style={wide ? styles.formColumn : undefined}><AddItemForm key={cloud?.selectedId ?? 'local'} editing={null} disabled={disabled} saving={list.saving}
              onSubmit={submit} onCancel={() => setEditing(null)} /></View>
            <View style={styles.listColumn}>
              <View style={styles.listHeader}><Heading level={2} style={styles.listTitle}>Tu lista</Heading><Text style={styles.count}>{list.items.length} {list.items.length === 1 ? 'producto' : 'productos'}</Text></View>
              <View style={styles.summary}><Text style={styles.pending}>{list.items.length - purchased} pendientes</Text>
                <Text style={styles.count}>{purchased} {purchased === 1 ? 'comprado' : 'comprados'}</Text></View>
              {list.loading ? <ActivityIndicator accessibilityLabel="Cargando lista" color={colors.primaryDark} style={{ padding: 40 }} /> :
                list.ready && <ShoppingList items={list.items} disabled={disabled} editingId={editing?.id ?? null} onToggle={id => { void list.toggle(id); }}
                  onEdit={item => setEditing(current => current?.id === item.id ? null : item)}
                  onCancel={() => setEditing(null)}
                  onSave={async (id, input) => { const saved = await list.edit(id, input); if (saved) setEditing(null); return saved; }}
                  onDelete={id => { void list.remove(id).then(saved => { if (saved && editing?.id === id) setEditing(null); }); }} />}
              <View style={styles.footer}>
                <Text accessibilityLiveRegion="polite" style={styles.localNote}>{list.saving ? 'Guardando cambios…' : cloud ? list.ready ? 'En tu cuenta · actualiza para ver cambios de otros dispositivos' : 'Selecciona o crea una lista en tu cuenta' : list.ready ? 'Guardado en este dispositivo' : 'Almacenamiento local'}</Text>
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
  intro: { paddingVertical: 32, gap: 10 }, kicker: { fontSize: 11, fontWeight: '700', letterSpacing: 2, color: colors.ink },
  heading: { fontSize: 44, fontWeight: '700', letterSpacing: -1.4, color: colors.ink }, subtitle: { fontSize: 16, color: colors.ink },
  columns: { gap: 28 }, wide: { flexDirection: 'row', alignItems: 'flex-start' }, formColumn: { width: 340 }, listColumn: { flex: 1, gap: 16 },
  listHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 }, listTitle: { fontSize: 24, fontWeight: '700', color: colors.ink },
  count: { fontSize: 13, color: colors.ink }, summary: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: colors.primarySoft, padding: 16, borderRadius: ui.radius.control, gap: 10 },
  pending: { fontSize: 13, fontWeight: '600', color: colors.ink }, footer: { gap: 14, marginTop: 4 }, localNote: { color: colors.ink, fontSize: 12 },
  bottom: { color: colors.ink, fontSize: 12, textAlign: 'center', marginTop: 40, marginBottom: 12 },
  errorBox: { padding: 16, backgroundColor: colors.errorBackground, borderRadius: ui.radius.control, marginBottom: 20, gap: 12 }, error: { color: colors.danger, lineHeight: 22 },
});

