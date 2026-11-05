import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { randomUUID } from 'expo-crypto';
import type { User } from '@supabase/supabase-js';
import { createThemedStyles } from '../contexts/ThemeContext';
import { ui } from '../constants/theme';
import { useHydration } from '../hooks/useHydration';
import { addWater, undoWater, waterAmount, waterTotal, litersToMl, formatLiters, waterBottles } from '../services/hydrationLogic';
import { dateKey, dayDate, shortDate, weekStart } from '../services/menuDates';
import { DAYS } from '../services/menuStorage';
import { AppHeader } from './AppHeader';
import { Heading } from './Heading';
import { Button } from './Button';
import { RecipeField } from './RecipeField';
import { WaterBottle } from './WaterBottle';

export function HydrationScreen({ user }: { user: User | null }) {
  const { colors, styles } = useStyles();
  const store = useHydration(user?.id ?? 'local');
  const [today, setToday] = useState(() => dateKey(new Date()));
  const [amount, setAmount] = useState('');
  const [goal, setGoal] = useState('');
  const [editingGoal, setEditingGoal] = useState(false);
  const [fieldError, setFieldError] = useState<{ field: 'amount' | 'goal'; message: string } | null>(null);
  const [notice, setNotice] = useState('');
  useEffect(() => { const timer = setInterval(() => setToday(dateKey(new Date())), 15000); return () => clearInterval(timer); }, []);
  const entries = store.data.days[today] ?? [];
  const total = waterTotal(entries);
  const goalMl = store.data.goalMl ?? 1000;
  const bottles = waterBottles(total, goalMl);
  const week = weekStart(dayDate(today, 0));
  async function register(value: string) {
    setNotice(''); setFieldError(null);
    let ml: number;
    try { ml = waterAmount(value); } catch (issue) { setFieldError({ field: 'amount', message: (issue as Error).message }); return; }
    const now = new Date();
    const date = dateKey(now);
    const entry = { id: randomUUID(), ml, at: now.toISOString() };
    if (await store.save(data => addWater(data, date, entry))) { setToday(date); setAmount(''); setNotice(`${ml} ml registrados. Tu día está actualizado.`); }
  }
  async function saveGoal() {
    setNotice(''); setFieldError(null);
    let ml: number;
    try { ml = litersToMl(goal); } catch (issue) { setFieldError({ field: 'goal', message: (issue as Error).message }); return; }
    if (await store.save(data => ({ ...data, goalMl: ml }))) { setEditingGoal(false); setNotice('Meta guardada. Puedes cambiarla cuando quieras.'); }
  }
  return <SafeAreaView style={styles.fill}><ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scroll}>
    <View style={styles.container}><AppHeader user={user} />
      <View style={styles.intro}><Text style={styles.kicker}>MI BIENESTAR</Text><Heading style={styles.heading}>Hidratación</Heading><Text style={styles.body}>Un registro sencillo del agua que tomas durante el día.</Text><Text style={styles.note}>{user ? 'Guardado en tu cuenta de Supabase. Tu agua y tu meta se recuperan al iniciar sesión.' : 'Sin sesión: guardado solo en este dispositivo. Inicia sesión para guardar en tu cuenta.'}</Text>
        {user && <Button label={store.busy ? 'Actualizando…' : 'Actualizar desde mi cuenta'} secondary disabled={store.busy || editingGoal} onPress={() => void store.reload()} />}
      </View>
      {!!store.error && <Text accessibilityRole="alert" style={styles.error}>{store.error}</Text>}
      {!store.ready ? store.busy ? <ActivityIndicator color={colors.primary} accessibilityLabel="Cargando hidratación" /> : <Button label="Volver a cargar" onPress={() => void store.reload()} /> : <View style={styles.stack}>
        {!!notice && <Text accessibilityLiveRegion="polite" style={styles.notice}>{notice}</Text>}
        <View style={styles.card}><Heading level={2} style={styles.title}>Hoy · {shortDate(dayDate(today, 0))}</Heading>
          <Text style={styles.total}>{total.toLocaleString('es-CL')} <Text style={styles.unit}>ml registrados</Text></Text>
          <Text style={styles.body}>Meta diaria: {formatLiters(goalMl)} {goalMl === 1000 ? 'litro' : 'litros'}</Text>
          <Button label="Editar meta en litros" secondary disabled={store.busy} onPress={() => { setGoal(formatLiters(goalMl)); setEditingGoal(true); setFieldError(null); }} />
          {editingGoal && <View style={styles.stack}><RecipeField fieldId="water-goal" label="Cantidad de litros al día" value={goal} onChangeText={setGoal} keyboardType="decimal-pad" maxLength={8} editable={!store.busy} placeholder="Ej. 1,5" error={fieldError?.field === 'goal' ? fieldError.message : undefined} />
            <Button label="Guardar meta" disabled={store.busy} onPress={() => void saveGoal()} /><Button label="Cancelar cambio de meta" secondary disabled={store.busy} onPress={() => { setEditingGoal(false); setFieldError(null); }} /></View>}
          <Heading level={3} style={styles.title}>Mis botellas · 1 litro cada una</Heading>
          {!!bottles.completedBefore && <Text style={styles.note}>{bottles.completedBefore} botellas completas anteriores. Se muestran las últimas 12.</Text>}
          <View style={styles.bottles}>{bottles.bottles.map(bottle => <WaterBottle key={bottle.number} number={bottle.number} total={bottle.ml} />)}</View>
          <Text style={styles.note}>Cuando completas una botella, el agua continúa en la siguiente.</Text>
          <Button label={store.busy ? 'Guardando…' : 'Agregar 200 ml'} disabled={store.busy} onPress={() => void register('200')} />
          <Text style={styles.body}>{Math.round(total / goalMl * 100)} % de tu meta diaria</Text>
            <View accessibilityRole="progressbar" accessibilityLabel="Progreso de hidratación" accessibilityValue={{ min: 0, max: goalMl, now: Math.min(total, goalMl), text: `${total} de ${goalMl} ml registrados` }} style={styles.track}><View style={[styles.progress, { width: `${Math.min(100, total / goalMl * 100)}%` }]} /></View>
            <Text style={styles.note}>{total >= goalMl ? 'Meta alcanzada. Si registras más agua, aparecerá en las botellas adicionales.' : 'Los registros se suman a lo largo del día.'}</Text>
        </View>
        <View style={styles.card}><Heading level={2} style={styles.title}>Registrar agua</Heading><Text style={styles.note}>Elige una cantidad o escribe cuánto tomaste.</Text>
          <View style={styles.quick}>{[150, 250, 500].map(ml => <View key={ml} style={styles.quickButton}><Button label={`+ ${ml} ml`} accessibilityLabel={`Registrar ${ml} ml de agua`} secondary disabled={store.busy} onPress={() => void register(String(ml))} /></View>)}</View>
          <RecipeField fieldId="water-amount" label="Otra cantidad (ml)" value={amount} onChangeText={setAmount} keyboardType="number-pad" maxLength={5} editable={!store.busy} placeholder="Ej. 300" error={fieldError?.field === 'amount' ? fieldError.message : undefined} />
          <Button label={store.busy ? 'Guardando…' : 'Registrar cantidad'} disabled={store.busy} onPress={() => void register(amount)} />
        </View>
        <View style={styles.card}><Heading level={2} style={styles.title}>Registros de hoy</Heading>
          {!entries.length ? <Text style={styles.note}>Aún no hay registros. Agrega el agua que tomaste para empezar.</Text> : <><Text style={styles.note}>{entries.length} {entries.length === 1 ? 'registro' : 'registros'} en total</Text>{entries.slice(-10).reverse().map(entry => <View key={entry.id} style={styles.row}><Text style={styles.body}>{entry.ml} ml</Text><Text style={styles.note}>{new Date(entry.at).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}</Text></View>)}
            {entries.length > 10 && <Text style={styles.note}>Se muestran los últimos 10 registros; el total incluye todos.</Text>}
            <Button label="Deshacer último registro de hoy" secondary disabled={store.busy} onPress={async () => { if (await store.save(data => undoWater(data, today, entries.at(-1)?.id))) setNotice('Último registro deshecho.'); }} /></>}
        </View>
        <View style={styles.card}><Heading level={2} style={styles.title}>Esta semana</Heading><Text style={styles.note}>Del {shortDate(dayDate(week, 0))} al {shortDate(dayDate(week, 6))}</Text>
          {DAYS.map((day, index) => { const date = dateKey(dayDate(week, index)); const records = store.data.days[date] ?? []; return <View key={date} style={styles.row}><Text style={styles.body}>{day}{date === today ? ' · hoy' : ''}</Text><Text style={styles.note}>{date > today ? '—' : records.length ? `${waterTotal(records).toLocaleString('es-CL')} ml` : 'Sin registro'}</Text></View>; })}
        </View>
      </View>}
    </View>
  </ScrollView></SafeAreaView>;
}
const useStyles = createThemedStyles(colors => StyleSheet.create({
  fill: { flex: 1, backgroundColor: colors.background }, scroll: { flexGrow: 1, padding: 20, paddingBottom: 32 }, container: { width: '100%', maxWidth: 760, alignSelf: 'center' },
  intro: { gap: 10, paddingVertical: 28 }, kicker: { color: colors.primary, fontWeight: '700', fontSize: 12, letterSpacing: 1.5 }, heading: { color: colors.ink, fontSize: 32, fontWeight: '800' },
  stack: { gap: 16 }, card: { padding: 20, gap: 14, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: ui.radius.card }, title: { color: colors.ink, fontWeight: '700', fontSize: 19 },
  body: { color: colors.ink, fontSize: 15, lineHeight: 23 }, note: { color: colors.muted, fontSize: 13, lineHeight: 21 }, total: { color: colors.primary, fontSize: 38, fontWeight: '800' }, unit: { color: colors.muted, fontSize: 15, fontWeight: '500' },
  track: { height: 12, borderRadius: 6, backgroundColor: colors.primarySoft, overflow: 'hidden' }, progress: { height: '100%', backgroundColor: colors.primary, borderRadius: 6 },
  row: { flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, paddingVertical: 8, borderTopWidth: 1, borderTopColor: colors.border },
  quick: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, quickButton: { flex: 1, minWidth: 88 }, error: { color: colors.danger, lineHeight: 22, marginBottom: 12 }, notice: { color: colors.primaryDark, backgroundColor: colors.primarySoft, padding: 14, borderRadius: ui.radius.control, lineHeight: 22 },
  bottles: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12 },
}));
