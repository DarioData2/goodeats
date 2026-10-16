import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Button } from './Button';
import { colors, ui } from '../constants/theme';
import type { useCloudShoppingList } from '../hooks/useCloudShoppingList';
import { Heading } from './Heading';

export function CloudListControls({ list }: { list: ReturnType<typeof useCloudShoppingList> }) {
  const [name, setName] = useState('Mi lista de compras');
  const disabled = list.loading || list.saving;
  return <View style={styles.card}>
    <Heading level={2} style={styles.title}>Mis listas en la cuenta</Heading>
    <View accessibilityRole="radiogroup" accessibilityLabel="Lista de compras activa" style={styles.options}>{list.lists.map(value => <Pressable key={value.id}
      accessibilityRole="radio" accessibilityLabel={`Lista ${value.name}`}
      aria-checked={value.id === list.selectedId} accessibilityState={{ checked: value.id === list.selectedId, disabled }} disabled={disabled}
      onPress={() => void list.selectList(value.id)} style={[styles.option, value.id === list.selectedId && styles.selected]}>
      <Text style={[styles.text, value.id === list.selectedId && { color: colors.onPrimary }]}>{value.id === list.selectedId ? '✓ ' : ''}{value.name}</Text>
    </Pressable>)}</View>
    {!list.loading && list.lists.length === 0 && <Text style={styles.text}>Crea tu primera lista para empezar a guardar productos en la nube.</Text>}
    <TextInput accessibilityLabel="Nombre de la nueva lista" value={name} onChangeText={setName}
      maxLength={120} editable={!disabled} placeholder="Nombre de la lista" placeholderTextColor={colors.muted} style={styles.input} />
    <View style={styles.options}>
      <Button label="Crear lista" disabled={disabled || !name.trim()} onPress={() => {
        void list.createList(name).then(created => { if (created) setName(''); });
      }} />
      <Button secondary label="Actualizar desde mi cuenta" disabled={disabled} onPress={() => void list.reload()} />
    </View>
    <Text style={styles.note}>Tus productos locales siguen en este dispositivo. Las listas de tu cuenta se guardan por separado.</Text>
  </View>;
}
const styles = StyleSheet.create({
  card: { padding: 20, borderRadius: ui.radius.card, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, gap: 12, marginBottom: 24 },
  title: { color: colors.ink, fontSize: 17, fontWeight: '700' }, text: { color: colors.ink }, note: { color: colors.muted, lineHeight: 21 },
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 }, option: { padding: 14, borderRadius: ui.radius.control, backgroundColor: colors.primarySoft },
  selected: { backgroundColor: colors.primary },
  input: { padding: 14, minHeight: 50, borderRadius: ui.radius.control, borderWidth: 1, borderColor: colors.controlBorder, color: colors.ink, backgroundColor: colors.input },
});
