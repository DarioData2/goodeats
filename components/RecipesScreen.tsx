import { useState, type ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ui } from '../constants/theme';
import { createThemedStyles } from '../contexts/ThemeContext';
import { dateKey, dayDate } from '../services/menuDates';
import { recipeLines } from '../services/recipeLogic';
import { useDailyRecipe } from '../hooks/useDailyRecipe';
import { AppHeader } from './AppHeader';
import { Button } from './Button';
import { MealIcon } from './MealIcon';

export function RecipesScreen({ user, toolbar }: { user: User | null; toolbar?: ReactNode }) {
  const [date, setDate] = useState(() => dateKey(new Date()));
  return <RecipeDay key={date} user={user} date={date} onDateChange={setDate} toolbar={toolbar} />;
}
function RecipeDay({ user, date, onDateChange, toolbar }: { user: User | null; date: string; onDateChange: (date: string) => void; toolbar?: ReactNode }) {
  const { colors, styles } = useStyles();
  const plan = useDailyRecipe(user?.id ?? 'local', date);
  const [cooking, setCooking] = useState(false);
  const disabled = !plan.ready || plan.loading || plan.saving;
  const label = dayDate(date, 0).toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  return <SafeAreaView style={styles.safe}>
    <KeyboardAvoidingView style={styles.safe} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scroll}>
        <View style={styles.container}>
          <AppHeader user={user} />{toolbar}
          <View style={styles.intro}><Text style={styles.kicker}>DE LA IDEA AL PLATO</Text>
            <Text accessibilityRole="header" style={styles.heading}>Recetas por fecha</Text>
            <Text style={styles.subtitle}>Guarda cómo preparar la comida del día y consulta la receta al cocinar.</Text>
            <Text style={styles.hint}>{user ? 'Guardado en tu cuenta.' : 'Guardado en este dispositivo.'}</Text>
            {user && <Button label="Actualizar desde mi cuenta" disabled={disabled || plan.dirty} onPress={() => { setCooking(false); void plan.reload(); }} />}
            {user && <Button label="Recuperar receta sin sesión" secondary disabled={disabled || plan.dirty} onPress={() => { setCooking(false); void plan.importLocal(); }} />}
            {user && <Text style={styles.hint}>Recuperar carga la receta local como borrador. Revísala antes de guardar y reemplazar la de esta fecha.</Text>}</View>
          <View style={styles.dateBar}>
            <Pressable accessibilityRole="button" accessibilityLabel="Día anterior" disabled={disabled || plan.dirty}
              onPress={() => onDateChange(dateKey(dayDate(date, -1)))} style={styles.arrow}><Text style={styles.arrowText}>‹</Text></Pressable>
            <View style={styles.dateCopy}><Text style={styles.kicker}>COMIDA DEL DÍA</Text><Text style={styles.date}>{label}</Text></View>
            <Pressable accessibilityRole="button" accessibilityLabel="Día siguiente" disabled={disabled || plan.dirty}
              onPress={() => onDateChange(dateKey(dayDate(date, 1)))} style={styles.arrow}><Text style={styles.arrowText}>›</Text></Pressable>
          </View>
          {plan.error && <View style={styles.errorBox}><Text accessibilityRole="alert" style={styles.error}>{plan.error}</Text>
            {!plan.ready && <Button label="Volver a cargar" disabled={plan.loading} onPress={() => void plan.reload()} />}</View>}
          {plan.loading ? <ActivityIndicator accessibilityLabel="Cargando receta" color={colors.primary} style={{ padding: 40 }} /> : plan.ready && <View style={styles.card}>
            {cooking ? <>
              <View style={styles.cardHeader}><MealIcon color={colors.accentText} /><Text accessibilityRole="header" style={styles.title}>{plan.saved.title}</Text></View>
              <Text style={styles.label}>Ingredientes</Text>
              {recipeLines(plan.saved.ingredients).length ? recipeLines(plan.saved.ingredients).map((line, index) => <Text key={index} style={styles.body}>• {line}</Text>) : <Text style={styles.hint}>Todavía no has añadido ingredientes.</Text>}
              <Text style={styles.label}>Preparación</Text>
              {recipeLines(plan.saved.steps).length ? recipeLines(plan.saved.steps).map((line, index) => <View key={index} style={styles.step}><Text style={styles.stepNumber}>{index + 1}</Text><Text style={styles.stepText}>{line}</Text></View>) : <Text style={styles.hint}>Todavía no has añadido los pasos.</Text>}
              <Button label="Editar receta" secondary onPress={() => setCooking(false)} />
            </> : <>
              <Text style={styles.title}>{plan.saved.title ? 'Tu receta del día' : '¿Qué prepararás hoy?'}</Text>
              <Text style={styles.label}>Nombre del plato</Text>
              <TextInput accessibilityLabel="Nombre del plato" value={plan.recipe.title} onChangeText={value => plan.update('title', value)}
                editable={!disabled} placeholder="Ej. Tortilla con ensalada" placeholderTextColor={colors.muted} maxLength={120} style={styles.input} />
              <Text style={styles.label}>Ingredientes</Text>
              <Text style={styles.hint}>Escribe un ingrediente y su cantidad por línea.</Text>
              <TextInput accessibilityLabel="Ingredientes" value={plan.recipe.ingredients} onChangeText={value => plan.update('ingredients', value)}
                editable={!disabled} multiline placeholder={'Ej. 2 huevos\n1 tomate'} placeholderTextColor={colors.muted} maxLength={4000} style={[styles.input, styles.multiline]} />
              <Text style={styles.label}>Pasos de preparación</Text>
              <Text style={styles.hint}>Escribe cada paso en una línea nueva.</Text>
              <TextInput accessibilityLabel="Pasos de preparación" value={plan.recipe.steps} onChangeText={value => plan.update('steps', value)}
                editable={!disabled} multiline placeholder={'Ej. Lava y corta las verduras.\nBate los huevos.'} placeholderTextColor={colors.muted} maxLength={6000} style={[styles.input, styles.multiline]} />
              <Button label={plan.saving ? 'Guardando…' : 'Guardar receta'} disabled={disabled || !plan.dirty} onPress={() => void plan.save()} />
              {plan.dirty && <Button label="Cancelar cambios" secondary disabled={disabled} onPress={plan.cancel} />}
              {!!plan.saved.title && !plan.dirty && <Button label="Ver preparación" onPress={() => setCooking(true)} />}
            </>}
          </View>}
          <Text accessibilityLiveRegion="polite" style={styles.note}>{plan.dirty ? 'Cambios sin guardar. Guarda o cancela antes de cambiar de día.' : plan.ready ? user ? 'Receta cargada desde tu cuenta.' : 'Recetas guardadas en este dispositivo, por día.' : ''}</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  </SafeAreaView>;
}
const useStyles = createThemedStyles(colors => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background }, scroll: { flexGrow: 1, paddingHorizontal: 20, paddingVertical: 24 },
  container: { width: '100%', maxWidth: 1080, alignSelf: 'center' }, intro: { paddingVertical: 30, gap: 10 },
  kicker: { fontSize: 11, fontWeight: '700', letterSpacing: 1.2, color: colors.ink }, heading: { fontSize: 34, fontWeight: '700', color: colors.ink },
  subtitle: { fontSize: 16, lineHeight: 24, color: colors.ink }, dateBar: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, backgroundColor: colors.accentSoft, padding: 10, marginBottom: 18 },
  dateCopy: { flex: 1, alignItems: 'center', gap: 5 }, date: { fontSize: 15, lineHeight: 21, fontWeight: '600', color: colors.ink, textAlign: 'center' },
  arrow: { width: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' }, arrowText: { fontSize: 30, color: colors.primaryDark },
  card: { backgroundColor: colors.surface, borderRadius: ui.radius.card, padding: 20, gap: 12, maxWidth: 760, width: '100%', alignSelf: 'center' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 }, title: { flexShrink: 1, fontSize: 22, fontWeight: '700', color: colors.ink },
  label: { fontSize: 15, fontWeight: '700', color: colors.ink, marginTop: 6 }, hint: { color: colors.muted, fontSize: 13, lineHeight: 20 },
  input: { minHeight: 48, padding: 12, borderRadius: ui.radius.control, borderWidth: 1, borderColor: colors.controlBorder, backgroundColor: colors.input, color: colors.ink, fontSize: 16 },
  multiline: { minHeight: 115, textAlignVertical: 'top' }, body: { fontSize: 16, lineHeight: 24, color: colors.ink },
  step: { flexDirection: 'row', gap: 10 }, stepNumber: { width: 28, height: 28, borderRadius: 8, textAlign: 'center', lineHeight: 28, backgroundColor: colors.accentSoft, color: colors.ink, fontWeight: '700' },
  stepText: { flex: 1, fontSize: 16, lineHeight: 24, color: colors.ink }, note: { marginVertical: 18, fontSize: 13, lineHeight: 20, textAlign: 'center', color: colors.ink },
  errorBox: { padding: 16, backgroundColor: colors.errorBackground, borderRadius: ui.radius.control, gap: 10, marginBottom: 16 }, error: { color: colors.danger, lineHeight: 22 },
}));
