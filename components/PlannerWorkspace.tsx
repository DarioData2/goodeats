import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { randomUUID } from 'expo-crypto';
import { Link } from 'expo-router';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ui } from '../constants/theme';
import { createThemedStyles } from '../contexts/ThemeContext';
import { usePlanner } from '../hooks/usePlanner';
import { AISLES, UNITS, MEAL_SLOTS, addSavedVideo, completeSavedVideo, blankWeek, planFromLegacyMenu, generateGroceries, normalize, positiveNumber, purchaseKey, validateRecipe, type Recipe, type WeekPlan } from '../services/plannerLogic';
import { DAYS } from '../services/menuStorage';
import { dayDate, shiftWeek, shortDate, weekStart } from '../services/menuDates';
import { loadMenu } from '../services/mealPlanningService';
import { formatQuantity } from '../services/quantities';
import { AppHeader } from './AppHeader';
import { Button } from './Button';
import { RecipesScreen } from './RecipesScreen';
import { WeeklyMenuScreen } from './WeeklyMenuScreen';
import ShoppingScreen from './ShoppingScreen';
import { Heading } from './Heading';
import { CompactSelect } from './CompactSelect';
import { RecipeField } from './RecipeField';
import { ModuleViews } from './ModuleViews';
import { recipeFormErrors, type IngredientDraft } from '../services/recipeForm';
import { VideoImport, VideoSourceLink } from './VideoImport';
import type { VideoBookmark } from '../services/videoRecipes';
import { IngredientIcon } from './IngredientIcon';

type Mode = 'recipes' | 'menu' | 'shopping';
type Store = ReturnType<typeof usePlanner>;
const titles = { recipes: 'Mis recetas', menu: 'Mi menú semanal', shopping: 'Compras del menú' };
export function PlannerWorkspace({ user, mode }: { user: User | null; mode: Mode }) {
  const { colors, styles } = useStyles();
  const [legacy, setLegacy] = useState(false);
  const [draftOpen, setDraftOpen] = useState(false);
  const owner = user?.id ?? 'local';
  const store = usePlanner(owner);
  const labels: [string, string] = mode === 'recipes' ? ['Biblioteca', 'Por fecha'] : mode === 'menu' ? ['Planificador', 'Menú anterior'] : ['Del menú', 'Manual'];
  const toolbar = <ModuleViews labels={labels} legacy={legacy} disabled={store.busy || draftOpen} onChange={value => { setLegacy(value); void store.reload(); }} />;
  if (legacy) return mode === 'recipes' ? <RecipesScreen user={user} toolbar={toolbar} /> : mode === 'menu' ? <WeeklyMenuScreen user={user} toolbar={toolbar} /> : <ShoppingScreen user={user} toolbar={toolbar} />;
  return <SafeAreaView style={styles.fill}><KeyboardAvoidingView style={styles.fill} behavior={Platform.OS === 'ios' ? 'padding' : undefined}><ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scroll}>
    <View style={styles.container}><AppHeader user={user} />{toolbar}
      <View style={styles.intro}><Heading style={styles.heading}>{titles[mode]}</Heading>
        <Text style={styles.body}>{mode === 'recipes' ? 'Tus platos favoritos, listos para volver a cocinar.' : mode === 'menu' ? 'Organiza desayunos, almuerzos, cenas, snacks y postres. Elige recetas y ajusta las porciones.' : 'Los ingredientes de tu semana, agrupados por sección.'}</Text>
        <Text style={styles.storage}>En este dispositivo · {user ? 'solo para esta cuenta · ' : ''}sin sincronización</Text>
      </View>
      {!!store.error && <Text accessibilityRole="alert" style={styles.error}>{store.error}</Text>}
      {!store.ready ? <View style={styles.card}>{store.busy ? <ActivityIndicator color={colors.primary} /> : <Button label="Volver a cargar" onPress={() => void store.reload()} />}</View> :
        mode === 'recipes' ? <Library store={store} onDraftChange={setDraftOpen} /> : <Weekly key={mode} store={store} owner={owner} shopping={mode === 'shopping'} onDraftChange={setDraftOpen} />}
    </View>
  </ScrollView></KeyboardAvoidingView></SafeAreaView>;
}

function Choices({ values, value, onChange, label, disabled = false }: { values: readonly string[]; value: string; onChange: (value: string) => void; label: string; disabled?: boolean }) {
  return <CompactSelect values={values} value={value} onChange={onChange} label={label} disabled={disabled} />;
}
type DraftIngredient = IngredientDraft;
const emptyIngredient = (): DraftIngredient => ({ name: '', quantity: '', unit: 'unidad', aisle: 'Otros' });
function Library({ store, onDraftChange }: { store: Store; onDraftChange: (value: boolean) => void }) {
  const { colors, styles } = useStyles();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('Todas');
  const [editing, setEditing] = useState<Recipe | 'new' | null>(null);
  const [viewing, setViewing] = useState<Recipe | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [options, setOptions] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [completing, setCompleting] = useState<VideoBookmark | null>(null);
  useEffect(() => { onDraftChange(!!editing || importing || !!completing); return () => onDraftChange(false); }, [editing, importing, completing, onDraftChange]);
  if (importing) return <VideoImport busy={store.busy} onCancel={() => setImporting(false)} onSave={async bookmark => {
    addSavedVideo(store.data, bookmark);
    if (await store.save(data => addSavedVideo(data, bookmark))) setImporting(false);
  }} />;
  if (completing) return <RecipeEditor key={completing.id} bookmark={completing} busy={store.busy} onCancel={() => setCompleting(null)} onSave={async recipe => {
    if (await store.save(data => completeSavedVideo(data, completing.id, recipe))) setCompleting(null);
  }} />;
  if (editing) return <RecipeEditor key={editing === 'new' ? 'new' : editing.id} recipe={editing === 'new' ? undefined : editing} busy={store.busy}
    onCancel={() => setEditing(null)} onSave={async recipe => { if (await store.save(data => ({ ...data, recipes: [...data.recipes.filter(item => item.id !== recipe.id), recipe] }))) setEditing(null); }} />;
  if (viewing) return <View style={styles.card}><Heading level={2} style={styles.title}>{viewing.title}</Heading><Text style={styles.hint}>{viewing.category} · {viewing.servings} porciones</Text>
    {viewing.source && <VideoSourceLink source={viewing.source} />}
    <Heading level={3} style={styles.label}>Ingredientes</Heading>{viewing.ingredients.map((item, index) => <Text key={index} style={styles.body}>• {formatQuantity(item.quantity)} {item.unit} de {item.name}</Text>)}
    <Heading level={3} style={styles.label}>Preparación</Heading>{viewing.steps.split('\n').filter(line => line.trim()).map((line, index) => <Text key={index} style={styles.body}>{index + 1}. {line}</Text>)}
    {!viewing.steps && <Text style={styles.hint}>Sin pasos de preparación.</Text>}<Button label="Volver a mis recetas" secondary onPress={() => setViewing(null)} /></View>;
  const categories = ['Todas', ...new Set(store.data.recipes.map(recipe => recipe.category))];
  const recipes = store.data.recipes.filter(recipe => normalize(recipe.title).includes(normalize(query)) && (category === 'Todas' || recipe.category === category));
  return <View style={styles.stack}>
    <Button label="Crear receta" onPress={() => setEditing('new')} disabled={store.busy} />
    <Button label="Importar desde video" secondary onPress={() => setImporting(true)} disabled={store.busy} />
    <TextInput accessibilityLabel="Buscar recetas" placeholder="Buscar por nombre" placeholderTextColor={colors.muted} style={styles.input} value={query} onChangeText={setQuery} />
    <Choices label="Categoría" values={categories} value={category} onChange={setCategory} />
    {!!store.data.savedVideos?.length && <View style={styles.stack}>
      <Heading level={2} style={styles.title}>Videos pendientes de completar</Heading>
      <Text style={styles.hint}>Estos enlaces aún no se pueden elegir en el menú ni generar compras. Completa sus ingredientes y porciones primero. Se muestran aparte de los filtros de recetas.</Text>
      {store.data.savedVideos.filter(bookmark => normalize(bookmark.title).includes(normalize(query))).map(bookmark => <View key={bookmark.id} style={styles.card}>
        <Heading level={3} style={styles.title}>{bookmark.title}</Heading><Text style={styles.hint}>Pendiente de completar</Text>
        <VideoSourceLink source={bookmark.source} />
        <Button label="Completar receta" accessibilityLabel={`Completar receta de ${bookmark.title}`} disabled={store.busy} onPress={() => setCompleting(bookmark)} />
        {deleting === bookmark.id ? <><Text style={styles.body}>¿Eliminar este enlace pendiente?</Text><Button label="Confirmar eliminación del enlace" disabled={store.busy} onPress={() => void store.save(data => ({ ...data, savedVideos: data.savedVideos?.filter(item => item.id !== bookmark.id) })).then(saved => { if (saved) setDeleting(null); })} /><Button label="Conservar enlace" secondary disabled={store.busy} onPress={() => setDeleting(null)} /></> : <Button label={`Eliminar enlace de ${bookmark.title}`} secondary disabled={store.busy} onPress={() => setDeleting(bookmark.id)} />}
      </View>)}
    </View>}
    {!recipes.length && <View style={styles.card}><Text style={styles.body}>{store.data.recipes.length ? 'No hay recetas con estos filtros.' : 'Crea tu primera receta con ingredientes y porciones. Después podrás elegirla en Mi menú.'}</Text></View>}
    {recipes.map(recipe => <View key={recipe.id} style={styles.card}>
      <Heading level={2} style={styles.title}>{recipe.title}</Heading><Text style={styles.hint}>{recipe.category} · {recipe.servings} {recipe.servings === 1 ? 'porción' : 'porciones'} · {recipe.ingredients.length} {recipe.ingredients.length === 1 ? 'ingrediente' : 'ingredientes'}</Text>
      {recipe.source && <VideoSourceLink source={recipe.source} />}
      <Button label="Ver preparación" accessibilityLabel={`Ver preparación de ${recipe.title}`} onPress={() => setViewing(recipe)} />
      <Button label={options === recipe.id ? 'Cerrar opciones' : 'Opciones de receta'} secondary accessibilityLabel={`Opciones de ${recipe.title}`} onPress={() => { setOptions(options === recipe.id ? null : recipe.id); setDeleting(null); }} />
      {options === recipe.id && <><Button label="Editar receta" accessibilityLabel={`Editar ${recipe.title}`} secondary onPress={() => setEditing(recipe)} disabled={store.busy} />
      {deleting === recipe.id ? <><Text style={styles.body}>¿Eliminar de la biblioteca? Los platos ya planificados conservarán su receta.</Text><Button label="Confirmar eliminación" disabled={store.busy} onPress={() => void store.save(data => ({ ...data, recipes: data.recipes.filter(item => item.id !== recipe.id) })).then(saved => { if (saved) { setDeleting(null); setCategory('Todas'); } })} /><Button label="Cancelar" secondary disabled={store.busy} onPress={() => setDeleting(null)} /></> : <Button label={`Eliminar ${recipe.title}`} secondary disabled={store.busy} onPress={() => setDeleting(recipe.id)} />}
      </>}
    </View>)}
  </View>;
}
function RecipeEditor({ recipe, bookmark, busy, onSave, onCancel }: { recipe?: Recipe; bookmark?: VideoBookmark; busy: boolean; onSave: (recipe: Recipe) => Promise<void>; onCancel: () => void }) {
  const { styles } = useStyles();
  const [id] = useState(() => recipe?.id ?? bookmark?.id ?? randomUUID());
  const source = recipe?.source ?? bookmark?.source;
  const [author, setAuthor] = useState(source?.author ?? '');
  const [title, setTitle] = useState(recipe?.title ?? bookmark?.title ?? '');
  const [category, setCategory] = useState(recipe?.category ?? '');
  const [servings, setServings] = useState(String(recipe?.servings ?? 2));
  const [steps, setSteps] = useState(recipe?.steps ?? '');
  const [ingredients, setIngredients] = useState<DraftIngredient[]>(() => recipe?.ingredients.map(item => ({ ...item, quantity: String(item.quantity) })) ?? [emptyIngredient()]);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [focusRequest, setFocusRequest] = useState<{ key: string } | null>(null);
  const fieldProps = (key: string) => ({ fieldId: `recipe-${id}-${key}`, error: fieldErrors[key], focusSignal: focusRequest?.key === key ? focusRequest : undefined, editable: !busy });
  const update = (index: number, field: keyof DraftIngredient, value: string) => setIngredients(previous => previous.map((item, slot) => slot === index ? { ...item, [field]: value } : item));
  async function save() {
    const errors = recipeFormErrors(title, servings, ingredients);
    setFieldErrors(errors);
    const first = Object.keys(errors)[0];
    if (first) { setError('Revisa los campos indicados antes de guardar.'); setFocusRequest({ key: first }); return; }
    try { const next = validateRecipe({ id, title, category, servings: positiveNumber(servings), steps, ingredients: ingredients.map(item => ({ ...item, quantity: positiveNumber(item.quantity) })), ...(source ? { source: { ...source, author } } : {}) }); setError(''); await onSave(next); }
    catch (issue) { setError((issue as Error).message); }
  }
  return <View style={styles.stack}>
    <View style={styles.card}><Heading level={2} style={styles.title}>{recipe ? 'Editar receta' : 'Nueva receta'}</Heading><Text style={styles.hint}>Guarda antes de salir. Las comidas ya planificadas conservarán su versión de la receta.</Text>
      {source && <><VideoSourceLink source={source} /><RecipeField fieldId={`recipe-${id}-author`} label="Autor o canal (opcional)" value={author} onChangeText={setAuthor} maxLength={120} editable={!busy} /><Text style={styles.hint}>Copia los ingredientes en los campos siguientes y pega los pasos en Preparación. Revisa las cantidades antes de guardar.</Text></>}
      {!!error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
      <RecipeField {...fieldProps('title')} label="Nombre del plato" accessibilityLabel="Nombre de la receta" value={title} onChangeText={setTitle} maxLength={120} placeholder="Ej. Ensalada de garbanzos" />
      <RecipeField {...fieldProps('category')} label="Categoría (opcional)" value={category} onChangeText={setCategory} maxLength={60} placeholder="Ej. Ensaladas" />
      <RecipeField {...fieldProps('servings')} label="Porciones de la receta" value={servings} onChangeText={setServings} keyboardType="decimal-pad" />
    </View>
    {ingredients.map((item, index) => <View key={index} style={styles.card}><Heading level={2} style={styles.label}>Ingrediente {index + 1}</Heading>
      <RecipeField {...fieldProps(`name-${index}`)} label="Nombre" accessibilityLabel={`Nombre ingrediente ${index + 1}`} value={item.name} onChangeText={value => update(index, 'name', value)} maxLength={120} placeholder="Ej. Garbanzos cocidos" />
      <View style={styles.fieldRow}><View style={styles.fieldColumn}><RecipeField {...fieldProps(`quantity-${index}`)} label="Cantidad" accessibilityLabel={`Cantidad ingrediente ${index + 1}`} value={item.quantity} onChangeText={value => update(index, 'quantity', value)} keyboardType="decimal-pad" placeholder="Ej. 250" /></View>
      <View style={styles.fieldColumn}><Choices values={UNITS} label={`Unidad ingrediente ${index + 1}`} value={item.unit} disabled={busy} onChange={value => update(index, 'unit', value)} /></View></View>
      <Choices values={AISLES} label={`Sección ingrediente ${index + 1}`} value={item.aisle} disabled={busy} onChange={value => update(index, 'aisle', value)} />
      {ingredients.length > 1 && <Button label={`Quitar ingrediente ${index + 1}`} secondary disabled={busy} onPress={() => setIngredients(previous => previous.filter((_, slot) => index !== slot))} />}
    </View>)}
    <Button label="Agregar ingrediente" secondary disabled={busy} onPress={() => setIngredients(previous => [...previous, emptyIngredient()])} />
    <View style={styles.card}><RecipeField {...fieldProps('steps')} label="Preparación · un paso por línea" accessibilityLabel="Preparación de la receta" value={steps} onChangeText={setSteps} maxLength={6000} multiline />
      <Button label={busy ? 'Guardando…' : 'Guardar en mis recetas'} disabled={busy} onPress={() => void save()} /><Button label="Cancelar edición" secondary disabled={busy} onPress={onCancel} /></View>
  </View>;
}

function Weekly({ store, owner, shopping, onDraftChange }: { store: Store; owner: string; shopping: boolean; onDraftChange: (value: boolean) => void }) {
  const { colors, styles } = useStyles();
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
  const [activeDay, setActiveDay] = useState(() => (new Date().getDay() + 6) % 7);
  useEffect(() => { onDraftChange(dirty || !!slot); return () => onDraftChange(false); }, [dirty, slot, onDraftChange]);
  const disabled = store.busy || importing;
  const groceries = generateGroceries(saved, store.data.pantry);
  function assign(recipe: Recipe | null) {
    if (!slot) return;
    try {
      const portions = recipe ? positiveNumber(servings) : 1;
      const next = current.map((day, d) => day.map((meal, m) => d === slot[0] && m === slot[1] ? recipe ? { recipe: JSON.parse(JSON.stringify(recipe)) as Recipe, servings: portions } : null : meal));
      setDraft(next); setSlot(null); setError(''); setNotice(''); setPreview(false);
    } catch (issue) { setError((issue as Error).message); }
  }
  async function save() {
    if (await store.save(data => {
      const keys = new Set(generateGroceries(current, data.pantry).items.map(purchaseKey));
      return { ...data, weeks: { ...data.weeks, [week]: current }, purchased: { ...data.purchased, [week]: (data.purchased[week] ?? []).filter(key => keys.has(key)) } };
    })) { setDraft(null); setNotice('Semana guardada. Tus compras se actualizaron.'); }
  }
  async function recover() {
    setImporting(true); setError('');
    try { const old = await loadMenu(owner, week); setDraft(planFromLegacyMenu(old)); setNotice('Menú anterior cargado como borrador. Asigna recetas para incluir sus ingredientes en las compras.'); }
    catch { setError('No pudimos recuperar el menú anterior. No se modificó tu planificación.'); }
    finally { setImporting(false); }
  }
  return <View style={styles.stack}>
    <View style={styles.calendar}><Button label="‹" accessibilityLabel="Semana anterior" secondary disabled={disabled || dirty || !!slot} onPress={() => { setWeek(shiftWeek(week, -1)); setPreview(false); setNotice(''); }} />
      <Text style={styles.range}>{shortDate(dayDate(week, 0))} – {shortDate(dayDate(week, 6))} {dayDate(week, 6).getFullYear()}</Text>
      <Button label="›" accessibilityLabel="Semana siguiente" secondary disabled={disabled || dirty || !!slot} onPress={() => { setWeek(shiftWeek(week, 1)); setPreview(false); setNotice(''); }} /></View>
    {!!error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}{!!notice && <Text accessibilityLiveRegion="polite" style={styles.hint}>{notice}</Text>}
    {!shopping && <>
      <View style={styles.card}><Text accessibilityLiveRegion="polite" style={styles.label}>{current.flat().filter(Boolean).length} {current.flat().filter(Boolean).length === 1 ? 'comida planificada' : 'comidas planificadas'}</Text>
        <Text style={styles.hint}>Elige un día para organizar sus comidas. ✓ indica comidas guardadas.</Text>
        <View style={styles.calendarDays}>{DAYS.map((day, index) => <Pressable key={day} accessibilityRole="button" accessibilityLabel={`${day}, ${shortDate(dayDate(week, index))}${saved[index].some(Boolean) ? ', con comidas guardadas' : ''}`} aria-pressed={activeDay === index} accessibilityState={{ selected: activeDay === index, disabled: !!slot }} disabled={!!slot} onPress={() => setActiveDay(index)} style={[styles.calendarDay, saved[index].some(Boolean) && styles.planned, activeDay === index && styles.currentDay]}><Text style={[styles.dayText, saved[index].some(Boolean) && styles.selectedText]}>{day.slice(0, 3)}</Text><Text style={[styles.dayText, saved[index].some(Boolean) && styles.selectedText]}>{dayDate(week, index).getDate()}{saved[index].some(Boolean) ? ' ✓' : ''}</Text></Pressable>)}</View>
        {dirty && <><Text accessibilityLiveRegion="polite" style={styles.hint}>Cambios sin guardar · se guardan todos los días de esta semana.</Text><Button label="Guardar cambios" disabled={disabled || !!slot} onPress={() => void save()} /></>}
      </View>
      {!store.data.weeks[week] && !dirty && <Button label="Recuperar esta semana del menú anterior" secondary disabled={disabled} onPress={() => void recover()} />}
      {DAYS.map((day, d) => d !== activeDay ? null : <View key={day} style={styles.card}><Heading level={2} style={styles.title}>{day} · {shortDate(dayDate(week, d))}</Heading>
        {MEAL_SLOTS.map((mealName, m) => { const meal = current[d][m]; const active = slot?.[0] === d && slot[1] === m; return <View key={mealName} style={styles.meal}>
          <Heading level={3} style={styles.label}>{mealName}</Heading><Text style={styles.body}>{meal ? 'recipe' in meal ? `${meal.recipe.title} · ${meal.servings} ${meal.servings === 1 ? 'porción' : 'porciones'}` : `${meal.text} · sin receta vinculada` : 'Sin planificar'}</Text>
          {active ? <View style={styles.stack}>
            <TextInput accessibilityLabel={`Buscar receta para ${mealName} del ${day}`} style={styles.input} value={query} onChangeText={setQuery} placeholder="Buscar receta" placeholderTextColor={colors.muted} />
            <Text style={styles.label}>Porciones a preparar</Text><TextInput accessibilityLabel={`Porciones para ${mealName} del ${day}`} style={styles.input} value={servings} onChangeText={setServings} keyboardType="decimal-pad" />
            {store.data.recipes.filter(recipe => normalize(recipe.title).includes(normalize(query))).map(recipe => <Button key={recipe.id} label={`Elegir ${recipe.title}`} secondary onPress={() => assign(recipe)} />)}
            {!store.data.recipes.length && <Text style={styles.hint}>Primero crea una receta en Mis recetas.</Text>}
            {store.data.recipes.length > 0 && !store.data.recipes.some(recipe => normalize(recipe.title).includes(normalize(query))) && <Text style={styles.hint}>No hay recetas con ese nombre.</Text>}
            {!!meal && <Button label="Quitar esta comida" secondary onPress={() => assign(null)} />}<Button label="Cerrar selección" secondary onPress={() => { setSlot(null); setError(''); }} />
          </View> : <Button label={meal ? 'Cambiar receta' : 'Elegir receta'} accessibilityLabel={`${meal ? 'Cambiar receta' : 'Elegir receta'} para ${mealName} del ${day}`} secondary disabled={disabled} onPress={() => { setSlot([d, m]); setQuery(''); setServings(meal && 'recipe' in meal ? String(meal.servings) : '2'); }} />}
        </View>; })}
      </View>)}
      <Button label={store.busy ? 'Guardando…' : 'Guardar menú semanal'} disabled={disabled || !dirty || !!slot} onPress={() => void save()} />
      {dirty && <><Text style={styles.hint}>Guarda o cancela antes de cambiar de semana. Las compras se calculan con el menú guardado.</Text><Button label="Cancelar cambios del menú" secondary disabled={disabled} onPress={() => { setDraft(null); setSlot(null); setError(''); setNotice(''); }} /></>}
      <Button label="Generar lista de compras" disabled={disabled || dirty || !!slot} onPress={() => setPreview(true)} />
    </>}
    {(shopping || preview) && <View style={styles.stack}><Heading level={2} style={styles.title}>Compras de la semana</Heading><Text style={styles.hint}>Las cantidades descuentan lo que tienes en tu despensa. Marca cada producto al comprarlo.</Text>
      <Link href="/despensa" asChild><Pressable accessibilityRole="link" style={styles.pantryLink}><Text style={styles.pantryLinkText}>Abrir Mi despensa</Text></Pressable></Link>
      {groceries.unlinked > 0 && <Text accessibilityRole="alert" style={styles.error}>{groceries.unlinked} comidas sin receta vinculada: sus ingredientes no se incluyeron.</Text>}
      {groceries.covered > 0 && <Text style={styles.hint}>Ya tienes la cantidad necesaria de {groceries.covered} {groceries.covered === 1 ? 'ingrediente' : 'ingredientes'} en tu despensa.</Text>}
      {!groceries.items.length && <View style={styles.card}><Text style={styles.body}>{groceries.covered ? 'Tu despensa cubre todos los ingredientes de las recetas de esta semana.' : 'Aún no hay ingredientes. Elige recetas en Mi menú y guarda la semana.'}</Text></View>}
      {AISLES.map(aisle => { const items = groceries.items.filter(item => item.aisle === aisle); return items.length ? <View key={aisle} style={styles.card}><Heading level={3} style={styles.title}>{aisle}</Heading>{items.map(item => {
        const key = purchaseKey(item); const checked = (store.data.purchased[week] ?? []).includes(key);
        return <Pressable key={item.key} accessibilityRole="checkbox" aria-checked={checked} accessibilityState={{ checked, disabled }} accessibilityLabel={`${item.name}, ${formatQuantity(item.quantity)} ${item.unit}`} disabled={disabled}
          onPress={() => void store.save(data => {
            if (!generateGroceries(data.weeks[week] ?? blankWeek(), data.pantry).items.some(grocery => purchaseKey(grocery) === key)) return data;
            const keys = new Set(data.purchased[week] ?? []);
            if (checked) keys.delete(key); else keys.add(key);
            return { ...data, purchased: { ...data.purchased, [week]: [...keys] } };
          })} style={styles.grocery}>
          <Text style={styles.check}>{checked ? '☑' : '☐'}</Text><IngredientIcon name={item.name} /><View style={styles.groceryCopy}><Text style={[styles.body, checked && styles.crossed]}>{item.name}</Text><Text style={styles.hint}>{formatQuantity(item.quantity)} {item.unit}</Text></View></Pressable>;
      })}</View> : null; })}
    </View>}
  </View>;
}
const useStyles = createThemedStyles(colors => StyleSheet.create({
  fill: { flex: 1, backgroundColor: colors.background }, scroll: { flexGrow: 1, padding: 20 }, container: { width: '100%', maxWidth: 1080, alignSelf: 'center' },
  intro: { gap: 12, paddingVertical: 28 }, heading: { color: colors.ink, fontSize: 32, fontWeight: '700' }, title: { color: colors.ink, fontSize: 20, fontWeight: '700' },
  body: { color: colors.ink, fontSize: 16, lineHeight: 24 }, hint: { color: colors.muted, fontSize: 14, lineHeight: 21 }, label: { color: colors.ink, fontSize: 15, fontWeight: '700' },
  storage: { color: colors.muted, fontSize: 14, lineHeight: 21 }, fieldRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 }, fieldColumn: { flex: 1, minWidth: 110 },
  card: { backgroundColor: colors.surface, borderRadius: ui.radius.card, borderColor: colors.border, borderWidth: 1, padding: 18, gap: 14 }, stack: { gap: 16 },
  input: { color: colors.ink, backgroundColor: colors.input, borderColor: colors.controlBorder, borderWidth: 1, borderRadius: ui.radius.control, minHeight: 48, padding: 12, fontSize: 16 }, multiline: { minHeight: 140, textAlignVertical: 'top' },
  choices: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, chip: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 12, paddingVertical: 10, borderRadius: ui.radius.control, backgroundColor: colors.primarySoft }, chipText: { color: colors.primary, fontSize: 14 }, selected: { backgroundColor: colors.primary }, selectedText: { color: colors.onPrimary },
  error: { color: colors.danger, fontSize: 14, lineHeight: 22 }, returnBar: { padding: 12 }, calendar: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 10 }, range: { color: colors.ink, fontWeight: '700', textAlign: 'center' },
  calendarDays: { flexDirection: 'row', gap: 2 }, calendarDay: { flex: 1, minHeight: 54, borderRadius: 8, borderWidth: 2, borderColor: colors.transparent, backgroundColor: colors.primarySoft, paddingVertical: 6, alignItems: 'center', justifyContent: 'center', gap: 6 }, planned: { backgroundColor: colors.primaryDark }, currentDay: { borderColor: colors.ink }, dayText: { fontSize: 12, color: colors.ink },
  meal: { borderTopWidth: 1, borderColor: colors.border, paddingTop: 14, gap: 10 }, grocery: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 12, borderTopWidth: 1, borderColor: colors.border, paddingVertical: 10 }, groceryCopy: { flex: 1 }, check: { color: colors.primary, fontSize: 26 }, crossed: { textDecorationLine: 'line-through', color: colors.muted },
  pantryLink: { minHeight: 48, alignSelf: 'flex-start', justifyContent: 'center', paddingHorizontal: 16, borderRadius: ui.radius.control, backgroundColor: colors.primarySoft },
  pantryLinkText: { fontSize: 15, fontWeight: '700', color: colors.primary },
}));
