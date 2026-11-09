import type { User } from '@supabase/supabase-js';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ui } from '../constants/theme';
import { createThemedStyles } from '../contexts/ThemeContext';
import { usePlanner } from '../hooks/usePlanner';
import { ingredientKey, positiveNumber, UNITS, updatePantry, validatePantryItem, type PantryItem } from '../services/plannerLogic';
import { formatQuantity } from '../services/quantities';
import { AppHeader } from './AppHeader';
import { Button } from './Button';
import { CompactSelect } from './CompactSelect';
import { Heading } from './Heading';
import { IngredientIcon } from './IngredientIcon';
import { IngredientNameField } from './IngredientNameField';
import { RecipeField } from './RecipeField';

export function PantryScreen({ user }: { user: User | null }) {
  const { colors, styles } = useStyles();
  const store = usePlanner(user?.id ?? 'local');
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('unidad');
  const [editing, setEditing] = useState<string | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const items = store.data.pantry ?? [];

  function reset() {
    setName(''); setQuantity(''); setUnit('unidad'); setEditing(null); setError('');
  }

  function edit(item: PantryItem) {
    setEditing(ingredientKey(item.name, item.unit)); setName(item.name); setUnit(item.unit);
    setQuantity(item.quantity.toLocaleString('en-US', { useGrouping: false, maximumSignificantDigits: 21 }));
    setError(''); setNotice('');
  }

  async function save() {
    setError(''); setNotice('');
    let item: PantryItem;
    try {
      item = validatePantryItem({ name, quantity: positiveNumber(quantity), unit });
    } catch (issue) {
      setError((issue as Error).message);
      return;
    }
    const key = ingredientKey(item.name, item.unit);
    if (key !== editing && items.some(value => ingredientKey(value.name, value.unit) === key)) {
      setError('Ya tienes este ingrediente en una unidad equivalente. Edita la cantidad de la fila guardada.');
      return;
    }
    if (await store.save(data => {
      const remaining = (data.pantry ?? []).filter(value => ingredientKey(value.name, value.unit) !== editing);
      return updatePantry(data, [...remaining, item]);
    })) {
      reset(); setNotice(`${item.name}: despensa actualizada.`);
    }
  }

  async function remove(key: string) {
    if (await store.save(data => updatePantry(data, (data.pantry ?? []).filter(item => ingredientKey(item.name, item.unit) !== key)))) {
      setRemoving(null); setNotice('Ingrediente retirado de la despensa.');
      if (editing === key) reset();
    }
  }

  const fields = <>
    <IngredientNameField label="Ingrediente" fieldId="pantry-name" value={name} onChangeText={setName} maxLength={120} placeholder="Ej. Tomate" editable={!store.busy} />
    <View style={styles.fields}>
      <View style={styles.field}><RecipeField label="Cantidad" fieldId="pantry-quantity" value={quantity} onChangeText={setQuantity} keyboardType="decimal-pad" placeholder="Ej. 500" editable={!store.busy} /></View>
      <View style={styles.field}><CompactSelect label="Unidad" values={UNITS} value={unit} onChange={setUnit} disabled={store.busy} /></View>
    </View>
    {!!error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
  </>;

  return <SafeAreaView style={styles.fill}><KeyboardAvoidingView style={styles.fill} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scroll}>
      <View style={styles.container}>
        <AppHeader user={user} />
        <View style={styles.intro}>
          <Heading style={styles.title}>Mi despensa</Heading>
          <Text style={styles.body}>Anota lo que tienes en casa. GoodEats lo descontará de las compras de tu menú.</Text>
          <Text style={styles.hint}>Guardada en este dispositivo. Actualiza las cantidades a medida que uses tus ingredientes.</Text>
          <Button secondary label="Ver compras del menú" onPress={() => router.navigate('/lista')} />
        </View>
        {!!store.error && <Text accessibilityRole="alert" style={styles.error}>{store.error}</Text>}
        {!store.ready ? (store.error && !store.busy ? <Button label="Volver a cargar" onPress={() => void store.reload()} /> : <ActivityIndicator color={colors.primary} accessibilityLabel="Cargando despensa" />) : <>
          {!editing && <View style={styles.card}>
            <Heading level={2} style={styles.section}>Agregar ingrediente</Heading>
            {fields}
            <Button label="Agregar a mi despensa" disabled={store.busy} onPress={() => void save()} />
          </View>}
          {!!notice && <Text accessibilityLiveRegion="polite" style={styles.hint}>{notice}</Text>}
          <View style={styles.card}>
            <Heading level={2} style={styles.section}>Lo que tienes en casa</Heading>
            {!items.length && <Text style={styles.hint}>Tu despensa está vacía. Empieza con un ingrediente que ya tengas.</Text>}
            {[...items].sort((a, b) => a.name.localeCompare(b.name, 'es')).map(item => {
              const key = ingredientKey(item.name, item.unit);
              return <View key={key} style={styles.item}>
                <View style={styles.row}>
                  <IngredientIcon name={item.name} /><View style={styles.itemText}><Text style={styles.name}>{item.name}</Text><Text style={styles.hint}>{formatQuantity(item.quantity)} {item.unit}</Text></View>
                  <Button secondary label="Editar" accessibilityLabel={`Editar ${item.name}`} disabled={store.busy || editing !== null || removing !== null} onPress={() => edit(item)} />
                </View>
                {editing === key && <>
                  {fields}
                  {removing === key ? <>
                    <Text style={styles.body}>¿Retirar {item.name} de tu despensa?</Text>
                    <Button label="Sí, retirar ingrediente" disabled={store.busy} onPress={() => void remove(key)} />
                    <Button secondary label="Conservar ingrediente" disabled={store.busy} onPress={() => setRemoving(null)} />
                  </> : <View style={styles.fields}>
                    <Button label="Guardar cambios" disabled={store.busy} onPress={() => void save()} />
                    <Button secondary label="Cancelar" disabled={store.busy} onPress={reset} />
                    <Button secondary label="Retirar" disabled={store.busy} onPress={() => { setRemoving(key); setError(''); }} />
                  </View>}
                </>}
              </View>;
            })}
          </View>
        </>}
      </View>
    </ScrollView>
  </KeyboardAvoidingView></SafeAreaView>;
}

const useStyles = createThemedStyles(colors => StyleSheet.create({
  fill: { flex: 1, backgroundColor: colors.background }, scroll: { flexGrow: 1, padding: 20 },
  container: { width: '100%', maxWidth: 1080, alignSelf: 'center', gap: 16 }, intro: { gap: 12, paddingVertical: 8 },
  title: { fontSize: 32, color: colors.ink }, section: { fontSize: 20, color: colors.ink },
  body: { color: colors.ink, fontSize: 16, lineHeight: 24 }, hint: { color: colors.muted, fontSize: 14, lineHeight: 21 },
  card: { backgroundColor: colors.surface, borderRadius: ui.radius.card, borderColor: colors.border, borderWidth: 1, padding: 18, gap: 14 },
  fields: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 }, field: { flex: 1, minWidth: 110 },
  item: { borderTopWidth: 1, borderColor: colors.border, paddingTop: 12, gap: 12 }, row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  itemText: { flex: 1 }, name: { color: colors.ink, fontSize: 16, fontWeight: '700' }, error: { color: colors.danger, fontSize: 14, lineHeight: 21 },
}));
