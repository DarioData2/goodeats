import { useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { randomUUID } from 'expo-crypto';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, ui } from '../constants/theme';
import { usePlanner } from '../hooks/usePlanner';
import { AISLES, UNITS, MEAL_SLOTS, blankWeek, generateGroceries, normalize, positiveNumber, purchaseKey, validateRecipe, type Recipe, type WeekPlan } from '../services/plannerLogic';
import { DAYS } from '../services/menuStorage';
import { dayDate, shiftWeek, shortDate, weekStart } from '../services/menuDates';
import { loadMenu } from '../services/mealPlanningService';
import { formatQuantity } from '../services/quantities';
import { AppHeader } from './AppHeader';
import { Button } from './Button';
import { RecipesScreen } from './RecipesScreen';
import { WeeklyMenuScreen } from './WeeklyMenuScreen';
import ShoppingScreen from './ShoppingScreen';

type Mode = 'recipes' | 'menu' | 'shopping';
type Store = ReturnType<typeof usePlanner>;
const titles = { recipes: 'Mis recetas', menu: 'Mi menú semanal', shopping: 'Compras del menú' };
export function PlannerWorkspace({ user, mode }: { user: User | null; mode: Mode }) {
  const [legacy, setLegacy] = useState(false);
  const owner = user?.id ?? 'local';
  const store = usePlanner(owner);
  const legacyLabel = mode === 'recipes' ? 'Recetas por fecha' : mode === 'menu' ? 'Menú anterior' : 'Lista manual';
  if (legacy) return <View style={styles.fill}>
    <View style={styles.returnBar}><Button label={`Volver a ${titles[mode].toLowerCase()}`} onPress={() => { setLegacy(false); void store.reload(); }} /></View>
    {mode === 'recipes' ? <RecipesScreen user={user} /> : mode === 'menu' ? <WeeklyMenuScreen user={user} /> : <ShoppingScreen user={user} />}
  </View>;
  return <SafeAreaView style={styles.fill}><KeyboardAvoidingView style={styles.fill} behavior={Platform.OS === 'ios' ? 'padding' : undefined}><ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scroll}>
    <View style={styles.container}><AppHeader user={user} />
      <View style={styles.intro}><Text accessibilityRole="header" style={styles.heading}>{titles[mode]}</Text>
        <Text style={styles.body}>{mode === 'recipes' ? 'Tus platos favoritos, listos para volver a cocinar.' : mode === 'menu' ? 'Elige recetas para cada comida y ajusta las porciones.' : 'Los ingredientes de tu semana, agrupados por sección.'}</Text>
        <Text style={styles.hint}>Nueva planificación guardada en este dispositivo{user ? ', separada para tu cuenta' : ''}. La sincronización de estas nuevas funciones llegará después.</Text>
        <Button label={legacyLabel} secondary disabled={store.busy} onPress={() => setLegacy(true)} />
      </View>
      {!!store.error && <Text accessibilityRole="alert" style={styles.error}>{store.error}</Text>}
      {!store.ready ? <View style={styles.card}>{store.busy ? <ActivityIndicator color={colors.primary} /> : <Button label="Volver a cargar" onPress={() => void store.reload()} />}</View> :
        mode === 'recipes' ? <Library store={store} /> : <Weekly key={mode} store={store} owner={owner} shopping={mode === 'shopping'} />}
    </View>
  </ScrollView></KeyboardAvoidingView></SafeAreaView>;
}

function Choices({ values, value, onChange, label, disabled = false }: { values: readonly string[]; value: string; onChange: (value: string) => void; label: string; disabled?: boolean }) {
  return <View style={styles.choices}>{values.map(option => <Pressable key={option} accessibilityRole="radio" accessibilityLabel={`${label}: ${option}`} aria-checked={option === value} accessibilityState={{ checked: option === value, disabled }} disabled={disabled} onPress={() => onChange(option)} style={[styles.chip, option === value && styles.selected]}>
    <Text style={[styles.chipText, option === value && styles.selectedText]}>{option === value ? '✓ ' : ''}{option}</Text>
  </Pressable>)}</View>;
}
type DraftIngredient = { name: string; quantity: string; unit: string; aisle: string };
const emptyIngredient = (): DraftIngredient => ({ name: '', quantity: '', unit: 'unidad', aisle: 'Otros' });
function Library({ store }: { store: Store }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('Todas');
  const [editing, setEditing] = useState<Recipe | 'new' | null>(null);
  const [viewing, setViewing] = useState<Recipe | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  if (editing) return <RecipeEditor key={editing === 'new' ? 'new' : editing.id} recipe={editing === 'new' ? undefined : editing} busy={store.busy}
    onCancel={() => setEditing(null)} onSave={async recipe => { if (await store.save(data => ({ ...data, recipes: [...data.recipes.filter(item => item.id !== recipe.id), recipe] }))) setEditing(null); }} />;
  if (viewing) return <View style={styles.card}><Text style={styles.title}>{viewing.title}</Text><Text style={styles.hint}>{viewing.category} · {viewing.servings} porciones</Text>
    <Text style={styles.label}>Ingredientes</Text>{viewing.ingredients.map((item, index) => <Text key={index} style={styles.body}>• {item.quantity} {item.unit} de {item.name}</Text>)}
    <Text style={styles.label}>Preparación</Text>{viewing.steps.split('\n').filter(line => line.trim()).map((line, index) => <Text key={index} style={styles.body}>{index + 1}. {line}</Text>)}
    {!viewing.steps && <Text style={styles.hint}>Sin pasos de preparación.</Text>}<Button label="Volver a mis recetas" secondary onPress={() => setViewing(null)} /></View>;
  const categories = ['Todas', ...new Set(store.data.recipes.map(recipe => recipe.category))];
  const recipes = store.data.recipes.filter(recipe => normalize(recipe.title).includes(normalize(query)) && (category === 'Todas' || recipe.category === category));
  return <View style={styles.stack}>
    <Button label="Crear receta" onPress={() => setEditing('new')} disabled={store.busy} />
    <TextInput accessibilityLabel="Buscar recetas" placeholder="Buscar por nombre" placeholderTextColor={colors.muted} style={styles.input} value={query} onChangeText={setQuery} />
    <Choices label="Categoría" values={categories} value={category} onChange={setCategory} />
    {!recipes.length && <View style={styles.card}><Text style={styles.body}>{store.data.recipes.length ? 'No hay recetas con estos filtros.' : 'Crea tu primera receta con ingredientes y porciones. Después podrás elegirla en Mi menú.'}</Text></View>}
    {recipes.map(recipe => <View key={recipe.id} style={styles.card}>
      <Text style={styles.title}>{recipe.title}</Text><Text style={styles.hint}>{recipe.category} · {recipe.servings} porciones · {recipe.ingredients.length} ingredientes</Text>
      <View style={styles.choices}><Button label="Ver preparación" secondary onPress={() => setViewing(recipe)} /><Button label={`Editar ${recipe.title}`} secondary onPress={() => setEditing(recipe)} disabled={store.busy} /></View>
      {deleting === recipe.id ? <><Text style={styles.body}>¿Eliminar de la biblioteca? Los platos ya planificados conservarán su receta.</Text><Button label="Confirmar eliminación" disabled={store.busy} onPress={() => void store.save(data => ({ ...data, recipes: data.recipes.filter(item => item.id !== recipe.id) })).then(saved => { if (saved) { setDeleting(null); setCategory('Todas'); } })} /><Button label="Cancelar" secondary disabled={store.busy} onPress={() => setDeleting(null)} /></> : <Button label={`Eliminar ${recipe.title}`} secondary disabled={store.busy} onPress={() => setDeleting(recipe.id)} />}
    </View>)}
  </View>;
}
function RecipeEditor({ recipe, busy, onSave, onCancel }: { recipe?: Recipe; busy: boolean; onSave: (recipe: Recipe) => Promise<void>; onCancel: () => void }) {
  const [id] = useState(() => recipe?.id ?? randomUUID());
  const [title, setTitle] = useState(recipe?.title ?? '');
  const [category, setCategory] = useState(recipe?.category ?? '');
  const [servings, setServings] = useState(String(recipe?.servings ?? 2));
  const [steps, setSteps] = useState(recipe?.steps ?? '');
  const [ingredients, setIngredients] = useState<DraftIngredient[]>(() => recipe?.ingredients.map(item => ({ ...item, quantity: String(item.quantity) })) ?? [emptyIngredient()]);
  const [error, setError] = useState('');
  const update = (index: number, field: keyof DraftIngredient, value: string) => setIngredients(previous => previous.map((item, slot) => slot === index ? { ...item, [field]: value } : item));
  async function save() {
    try { const next = validateRecipe({ id, title, category, servings: positiveNumber(servings), steps, ingredients: ingredients.map(item => ({ ...item, quantity: positiveNumber(item.quantity) })) }); setError(''); await onSave(next); }
    catch (issue) { setError((issue as Error).message); }
  }
  return <View style={styles.stack}>
    <View style={styles.card}><Text style={styles.title}>{recipe ? 'Editar receta' : 'Nueva receta'}</Text><Text style={styles.hint}>Guarda antes de salir de esta pantalla. Los platos ya planificados conservan su versión; vuelve a elegir la receta en el menú si quieres actualizarlos.</Text>
      <Text style={styles.label}>Nombre del plato</Text><TextInput accessibilityLabel="Nombre de la receta" value={title} onChangeText={setTitle} maxLength={120} editable={!busy} style={styles.input} placeholder="Ej. Ensalada de garbanzos" placeholderTextColor={colors.muted} />
      <Text style={styles.label}>Categoría</Text><TextInput accessibilityLabel="Categoría de la receta" value={category} onChangeText={setCategory} maxLength={60} editable={!busy} style={styles.input} placeholder="Ej. Ensaladas" placeholderTextColor={colors.muted} />
      <Text style={styles.label}>Porciones de esta receta</Text><TextInput accessibilityLabel="Porciones de la receta" value={servings} onChangeText={setServings} editable={!busy} keyboardType="decimal-pad" style={styles.input} />
    </View>
    {ingredients.map((item, index) => <View key={index} style={styles.card}><Text style={styles.label}>Ingrediente {index + 1}</Text>
      <TextInput accessibilityLabel={`Nombre ingrediente ${index + 1}`} value={item.name} onChangeText={value => update(index, 'name', value)} editable={!busy} maxLength={120} placeholder="Ej. Garbanzos cocidos" placeholderTextColor={colors.muted} style={styles.input} />
      <TextInput accessibilityLabel={`Cantidad ingrediente ${index + 1}`} value={item.quantity} onChangeText={value => update(index, 'quantity', value)} editable={!busy} keyboardType="decimal-pad" placeholder="Cantidad, ej. 250" placeholderTextColor={colors.muted} style={styles.input} />
      <Text style={styles.label}>Unidad</Text><Choices values={UNITS} label={`Unidad ingrediente ${index + 1}`} value={item.unit} disabled={busy} onChange={value => update(index, 'unit', value)} />
      <Text style={styles.label}>Sección de compra</Text><Choices values={AISLES} label={`Sección ingrediente ${index + 1}`} value={item.aisle} disabled={busy} onChange={value => update(index, 'aisle', value)} />
      {ingredients.length > 1 && <Button label={`Quitar ingrediente ${index + 1}`} secondary disabled={busy} onPress={() => setIngredients(previous => previous.filter((_, slot) => index !== slot))} />}
    </View>)}
    <Button label="Agregar ingrediente" secondary disabled={busy} onPress={() => setIngredients(previous => [...previous, emptyIngredient()])} />
    <View style={styles.card}><Text style={styles.label}>Preparación · un paso por línea</Text><TextInput accessibilityLabel="Preparación de la receta" value={steps} onChangeText={setSteps} maxLength={6000} editable={!busy} multiline style={[styles.input, styles.multiline]} />
      {!!error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}<Button label={busy ? 'Guardando…' : 'Guardar en mis recetas'} disabled={busy} onPress={() => void save()} /><Button label="Cancelar edición" secondary disabled={busy} onPress={onCancel} /></View>
  </View>;
}

function Weekly({ store, owner, shopping }: { store: Store; owner: string; shopping: boolean }) {
  const [week, setWeek] = useState(weekStart);
  const [draft, setDraft] = useState<WeekPlan | null>(null);
  const [slot, setSlot] = useState<[number, number] | null>(null);
  const [query, setQuery] = useState('');
  const [servings, setServings] = useState('2');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [importing, setImporting] = useState(false);
  const [preview, setPreview] = useState(false);
  const saved = store.data.weeks[week] ?? blankWeek();
  const current = draft ?? saved;
  const dirty = draft !== null;
  const disabled = store.busy || importing;
  const groceries = generateGroceries(saved);
  function assign(recipe: Recipe | null) {
    if (!slot) return;
    try {
      const portions = recipe ? positiveNumber(servings) : 1;
      const next = current.map((day, d) => day.map((meal, m) => d === slot[0] && m === slot[1] ? recipe ? { recipe: JSON.parse(JSON.stringify(recipe)) as Recipe, servings: portions } : null : meal));
      setDraft(next); setSlot(null); setError(''); setNotice(''); setPreview(false);
    } catch (issue) { setError((issue as Error).message); }
  }
  async function save() {
    if (await store.save(data => ({ ...data, weeks: { ...data.weeks, [week]: current }, purchased: { ...data.purchased, [week]: (data.purchased[week] ?? []).filter(key => generateGroceries(current).items.some(item => purchaseKey(item) === key)) } }))) { setDraft(null); setNotice('Semana guardada. Tus compras se actualizaron.'); }
  }
  async function recover() {
    setImporting(true); setError('');
    try { const old = await loadMenu(owner, week); setDraft(old.map(day => [...day.map(text => text.trim() ? { text } : null), null])); setNotice('Menú anterior cargado como borrador. Asigna recetas para incluir sus ingredientes en las compras.'); }
    catch { setError('No pudimos recuperar el menú anterior. No se modificó tu planificación.'); }
    finally { setImporting(false); }
  }
  return <View style={styles.stack}>
    <View style={styles.calendar}><Button label="‹ Anterior" secondary disabled={disabled || dirty || !!slot} onPress={() => { setWeek(shiftWeek(week, -1)); setPreview(false); setNotice(''); }} />
      <Text style={styles.range}>{shortDate(dayDate(week, 0))} – {shortDate(dayDate(week, 6))} {dayDate(week, 6).getFullYear()}</Text>
      <Button label="Siguiente ›" secondary disabled={disabled || dirty || !!slot} onPress={() => { setWeek(shiftWeek(week, 1)); setPreview(false); setNotice(''); }} /></View>
    {!!error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}{!!notice && <Text accessibilityLiveRegion="polite" style={styles.hint}>{notice}</Text>}
    {!shopping && <>
      <View style={styles.card}><Text style={styles.label}>{current.flat().filter(Boolean).length} comidas planificadas</Text><View style={styles.calendarDays}>{DAYS.map((day, index) => <View key={day} style={[styles.calendarDay, saved[index].some(Boolean) && styles.planned]}><Text style={[styles.dayText, saved[index].some(Boolean) && styles.selectedText]}>{day.slice(0, 3)}</Text><Text style={[styles.dayText, saved[index].some(Boolean) && styles.selectedText]}>{dayDate(week, index).getDate()}{saved[index].some(Boolean) ? ' ✓' : ''}</Text></View>)}</View></View>
      {!store.data.weeks[week] && !dirty && <Button label="Recuperar esta semana del menú anterior" secondary disabled={disabled} onPress={() => void recover()} />}
      {DAYS.map((day, d) => <View key={day} style={styles.card}><Text style={styles.title}>{day} · {shortDate(dayDate(week, d))}</Text>
        {MEAL_SLOTS.map((mealName, m) => { const meal = current[d][m]; const active = slot?.[0] === d && slot[1] === m; return <View key={mealName} style={styles.meal}>
          <Text style={styles.label}>{mealName}</Text><Text style={styles.body}>{meal ? 'recipe' in meal ? `${meal.recipe.title} · ${meal.servings} porciones` : `${meal.text} · sin receta vinculada` : 'Sin planificar'}</Text>
          {active ? <View style={styles.stack}>
            <TextInput accessibilityLabel={`Buscar receta para ${mealName} del ${day}`} style={styles.input} value={query} onChangeText={setQuery} placeholder="Buscar receta" placeholderTextColor={colors.muted} />
            <Text style={styles.label}>Porciones a preparar</Text><TextInput accessibilityLabel={`Porciones para ${mealName} del ${day}`} style={styles.input} value={servings} onChangeText={setServings} keyboardType="decimal-pad" />
            {store.data.recipes.filter(recipe => normalize(recipe.title).includes(normalize(query))).map(recipe => <Button key={recipe.id} label={`Elegir ${recipe.title}`} secondary onPress={() => assign(recipe)} />)}
            {!store.data.recipes.length && <Text style={styles.hint}>Primero crea una receta en Mis recetas.</Text>}
            {store.data.recipes.length > 0 && !store.data.recipes.some(recipe => normalize(recipe.title).includes(normalize(query))) && <Text style={styles.hint}>No hay recetas con ese nombre.</Text>}
            {!!meal && <Button label="Quitar esta comida" secondary onPress={() => assign(null)} />}<Button label="Cerrar selección" secondary onPress={() => { setSlot(null); setError(''); }} />
          </View> : <Button label={`${meal ? 'Cambiar' : 'Elegir receta'} · ${mealName} del ${day}`} secondary disabled={disabled} onPress={() => { setSlot([d, m]); setQuery(''); setServings(meal && 'recipe' in meal ? String(meal.servings) : '2'); }} />}
        </View>; })}
      </View>)}
      <Button label={store.busy ? 'Guardando…' : 'Guardar menú semanal'} disabled={disabled || !dirty || !!slot} onPress={() => void save()} />
      {dirty && <><Text style={styles.hint}>Guarda o cancela antes de cambiar de semana. Las compras se calculan con el menú guardado.</Text><Button label="Cancelar cambios del menú" secondary disabled={disabled} onPress={() => { setDraft(null); setSlot(null); setError(''); setNotice(''); }} /></>}
      <Button label="Generar lista de compras" disabled={disabled || dirty || !!slot} onPress={() => setPreview(true)} />
    </>}
    {(shopping || preview) && <View style={styles.stack}><Text style={styles.title}>Compras de la semana</Text><Text style={styles.hint}>Se actualizan al guardar el menú. Puedes marcarlas aquí o en Mi lista → Compras del menú. Las unidades de peso y volumen compatibles se suman; otras unidades se mantienen separadas.</Text>
      {groceries.unlinked > 0 && <Text accessibilityRole="alert" style={styles.error}>{groceries.unlinked} comidas sin receta vinculada: sus ingredientes no se incluyeron.</Text>}
      {!groceries.items.length && <View style={styles.card}><Text style={styles.body}>Aún no hay ingredientes. Elige recetas en Mi menú y guarda la semana.</Text></View>}
      {AISLES.map(aisle => { const items = groceries.items.filter(item => item.aisle === aisle); return items.length ? <View key={aisle} style={styles.card}><Text style={styles.title}>{aisle}</Text>{items.map(item => {
        const key = purchaseKey(item); const checked = (store.data.purchased[week] ?? []).includes(key);
        return <Pressable key={item.key} accessibilityRole="checkbox" aria-checked={checked} accessibilityState={{ checked, disabled }} accessibilityLabel={`${item.name}, ${formatQuantity(item.quantity)} ${item.unit}`} disabled={disabled}
          onPress={() => void store.save(data => { const keys = data.purchased[week] ?? []; return { ...data, purchased: { ...data.purchased, [week]: checked ? keys.filter(value => value !== key) : [...keys, key] } }; })} style={styles.grocery}>
          <Text style={styles.check}>{checked ? '☑' : '☐'}</Text><View style={styles.groceryCopy}><Text style={[styles.body, checked && styles.crossed]}>{item.name}</Text><Text style={styles.hint}>{formatQuantity(item.quantity)} {item.unit}</Text></View></Pressable>;
      })}</View> : null; })}
    </View>}
  </View>;
}
const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: colors.background }, scroll: { flexGrow: 1, padding: 20 }, container: { width: '100%', maxWidth: 1080, alignSelf: 'center' },
  intro: { gap: 12, paddingVertical: 28 }, heading: { color: colors.ink, fontSize: 32, fontWeight: '700' }, title: { color: colors.ink, fontSize: 20, fontWeight: '700' },
  body: { color: colors.ink, fontSize: 16, lineHeight: 24 }, hint: { color: colors.muted, fontSize: 13, lineHeight: 20 }, label: { color: colors.ink, fontSize: 15, fontWeight: '700' },
  card: { backgroundColor: colors.surface, borderRadius: ui.radius.card, borderColor: colors.border, borderWidth: 1, padding: 18, gap: 14 }, stack: { gap: 16 },
  input: { color: colors.ink, backgroundColor: colors.input, borderColor: colors.controlBorder, borderWidth: 1, borderRadius: ui.radius.control, minHeight: 48, padding: 12, fontSize: 16 }, multiline: { minHeight: 140, textAlignVertical: 'top' },
  choices: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, chip: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 12, paddingVertical: 10, borderRadius: ui.radius.control, backgroundColor: colors.primarySoft }, chipText: { color: colors.primary, fontSize: 14 }, selected: { backgroundColor: colors.primary }, selectedText: { color: colors.onPrimary },
  error: { color: colors.danger, fontSize: 14, lineHeight: 22 }, returnBar: { padding: 12 }, calendar: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 10 }, range: { color: colors.ink, fontWeight: '700', textAlign: 'center' },
  calendarDays: { flexDirection: 'row', gap: 4 }, calendarDay: { flex: 1, borderRadius: 8, backgroundColor: colors.primarySoft, paddingVertical: 10, alignItems: 'center', gap: 6 }, planned: { backgroundColor: colors.primary }, dayText: { fontSize: 12, color: colors.ink },
  meal: { borderTopWidth: 1, borderColor: colors.border, paddingTop: 14, gap: 10 }, grocery: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 12, borderTopWidth: 1, borderColor: colors.border, paddingVertical: 10 }, groceryCopy: { flex: 1 }, check: { color: colors.primary, fontSize: 26 }, crossed: { textDecorationLine: 'line-through', color: colors.muted },
});
