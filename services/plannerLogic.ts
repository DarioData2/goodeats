import { roundQuantity } from './quantities';
import { parseVideoUrl, validateVideoBookmark, validateVideoSource, type VideoBookmark, type VideoSource } from './videoRecipes';

export const MEAL_SLOTS = ['Desayuno', 'Almuerzo', 'Cena', 'Snacks', 'Postres'] as const;
export const AISLES = ['Frutas y verduras', 'Carnes y pescados', 'Lácteos y huevos', 'Despensa', 'Panadería', 'Congelados', 'Otros'] as const;
export const UNITS = ['unidad', 'g', 'kg', 'ml', 'litro', 'cucharada', 'cucharadita', 'taza', 'paquete'] as const;
export type Ingredient = { name: string; quantity: number; unit: string; aisle: string };
export type Recipe = { id: string; title: string; category: string; servings: number; ingredients: Ingredient[]; steps: string; source?: VideoSource };
// A snapshot keeps a saved meal stable when its library recipe is edited later.
export type Meal = { recipe: Recipe; servings: number } | { text: string } | null;
export type WeekPlan = Meal[][];
export type PantryItem = Pick<Ingredient, 'name' | 'quantity' | 'unit'>;
export type PlannerData = { version: 1; recipes: Recipe[]; weeks: Record<string, WeekPlan>; purchased: Record<string, string[]>; savedVideos?: VideoBookmark[]; pantry?: PantryItem[] };
export type Grocery = Ingredient & { key: string };
export const blankWeek = (): WeekPlan => Array.from({ length: 7 }, () => Array<Meal>(MEAL_SLOTS.length).fill(null));
export const planFromLegacyMenu = (menu: string[][]): WeekPlan => menu.map(day =>
  MEAL_SLOTS.map((_, index) => day[index]?.trim() ? { text: day[index] } : null));
export const blankPlanner = (): PlannerData => ({ version: 1, recipes: [], weeks: {}, purchased: {} });
export const normalize = (value: string) => value.trim().toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ');
export function positiveNumber(value: string): number {
  const normalized = value.trim().replace(',', '.');
  if (!/^\d+(\.\d+)?$/.test(normalized)) throw new Error('Usa una cantidad numérica mayor que cero.');
  const number = Number(normalized);
  if (!Number.isFinite(number) || number <= 0 || number > 1000000) throw new Error('La cantidad debe ser mayor que cero y no superar 1.000.000.');
  return number;
}
const baseUnit = (unit: string) => unit === 'kg' ? 'g' : unit === 'litro' ? 'ml' : unit;
const unitFactor = (unit: string) => unit === 'kg' || unit === 'litro' ? 1000 : 1;
export const ingredientKey = (name: string, unit: string) => JSON.stringify([normalize(name), baseUnit(unit)]);

export function validatePantryItem(item: PantryItem): PantryItem {
  if (!item || typeof item.name !== 'string' || !item.name.trim() || item.name.length > 120 ||
    !UNITS.some(unit => unit === item.unit) || !Number.isFinite(item.quantity) || item.quantity <= 0 || item.quantity > 1000000) {
    throw new Error('Revisa el nombre, la cantidad y la unidad del ingrediente.');
  }
  return { name: item.name.trim(), quantity: item.quantity, unit: item.unit };
}
export function validateRecipe(recipe: Recipe): Recipe {
  if (!recipe.id || !recipe.title.trim() || recipe.title.length > 120) throw new Error('Escribe un nombre de receta de hasta 120 caracteres.');
  if (!Number.isFinite(recipe.servings) || recipe.servings <= 0 || recipe.servings > 1000000) throw new Error('Revisa las porciones.');
  if (!recipe.ingredients.length) throw new Error('Agrega al menos un ingrediente.');
  if (recipe.steps.length > 6000 || recipe.category.length > 60) throw new Error('El texto supera el tamaño permitido.');
  return { ...recipe, ...(recipe.source !== undefined ? { source: validateVideoSource(recipe.source) } : {}), title: recipe.title.trim(), category: recipe.category.trim() || 'Sin categoría', steps: recipe.steps.trim(), ingredients: recipe.ingredients.map(item => {
    if (!item.name.trim() || item.name.length > 120 || !UNITS.includes(item.unit as typeof UNITS[number]) || !AISLES.includes(item.aisle as typeof AISLES[number]) || !Number.isFinite(item.quantity) || item.quantity <= 0 || item.quantity > 1000000) throw new Error('Revisa el nombre, cantidad, unidad y sección de cada ingrediente.');
    return { ...item, name: item.name.trim() };
  }) };
}
export function generateGroceries(week: WeekPlan, pantry: PantryItem[] = []): { items: Grocery[]; unlinked: number; covered: number } {
  const grouped = new Map<string, Grocery>();
  const stock = new Map(pantry.map(item => [ingredientKey(item.name, item.unit), roundQuantity(item.quantity * unitFactor(item.unit))]));
  let unlinked = 0;
  for (const day of week) for (const meal of day) {
    if (!meal) continue;
    if ('text' in meal) { if (meal.text.trim()) unlinked++; continue; }
    const factor = meal.servings / meal.recipe.servings;
    for (const ingredient of meal.recipe.ingredients) {
      const unit = baseUnit(ingredient.unit);
      const quantity = ingredient.quantity * factor * unitFactor(ingredient.unit);
      // Category is not an identity: identical ingredients assigned to different aisles still merge.
      const key = ingredientKey(ingredient.name, unit);
      const previous = grouped.get(key);
      grouped.set(key, { ...ingredient, unit, key, quantity: quantity + (previous?.quantity ?? 0), aisle: previous?.aisle ?? ingredient.aisle });
    }
  }
  const items = [...grouped.values()].map(item => ({ ...item, quantity: roundQuantity(roundQuantity(item.quantity) - (stock.get(item.key) ?? 0)) }))
    .filter(item => item.quantity > 0)
    .sort((a, b) => AISLES.indexOf(a.aisle as typeof AISLES[number]) - AISLES.indexOf(b.aisle as typeof AISLES[number]) || a.name.localeCompare(b.name, 'es'));
  return { items, unlinked, covered: grouped.size - items.length };
}
export const purchaseKey = (item: Grocery) => JSON.stringify([item.key, item.quantity]);
export function updatePantry(data: PlannerData, pantry: PantryItem[]): PlannerData {
  const purchased = { ...data.purchased };
  for (const [week, keys] of Object.entries(purchased)) {
    if (!keys.length || !data.weeks[week]) continue;
    const currentKeys = new Set(generateGroceries(data.weeks[week], pantry).items.map(purchaseKey));
    purchased[week] = keys.filter(key => currentKeys.has(key));
  }
  return { ...data, pantry, purchased };
}
export function addSavedVideo(data: PlannerData, input: VideoBookmark): PlannerData {
  const bookmark = validateVideoBookmark(input);
  const urls = [...(data.savedVideos ?? []).map(item => item.source.url), ...data.recipes.flatMap(item => item.source ? [item.source.url] : [])];
  if (urls.some(url => parseVideoUrl(url).url === bookmark.source.url)) throw new Error('Este enlace ya está en tu biblioteca o entre los pendientes.');
  return { ...data, savedVideos: [...(data.savedVideos ?? []), bookmark] };
}
export function completeSavedVideo(data: PlannerData, bookmarkId: string, input: Recipe): PlannerData {
  const bookmark = data.savedVideos?.find(item => item.id === bookmarkId);
  if (!bookmark) throw new Error('El enlace pendiente ya no está disponible. Vuelve a cargar la biblioteca.');
  const recipe = validateRecipe({ ...input, source: { ...bookmark.source, author: input.source?.author } });
  return { ...data, recipes: [...data.recipes.filter(item => item.id !== recipe.id), recipe], savedVideos: data.savedVideos?.filter(item => item.id !== bookmarkId) };
}
export function decodePlanner(raw: string | null): PlannerData {
  if (raw === null) return blankPlanner();
  const data = JSON.parse(raw) as PlannerData;
  if (data.version !== 1 || !Array.isArray(data.recipes) || !data.weeks || !data.purchased) throw new Error('Formato de planificación inválido.');
  data.recipes.forEach(validateRecipe);
  if (data.pantry !== undefined) {
    if (!Array.isArray(data.pantry)) throw new Error('Despensa inválida.');
    data.pantry = data.pantry.map(validatePantryItem);
    if (new Set(data.pantry.map(item => ingredientKey(item.name, item.unit))).size !== data.pantry.length) throw new Error('Ingredientes duplicados en la despensa.');
  }
  if (data.savedVideos !== undefined) {
    if (!Array.isArray(data.savedVideos)) throw new Error('Videos guardados inválidos.');
    data.savedVideos = data.savedVideos.map(validateVideoBookmark);
  }
  for (const [key, week] of Object.entries(data.weeks)) {
    if (!Array.isArray(week) || week.length !== 7 || week.some(day => !Array.isArray(day) || (day.length !== 4 && day.length !== MEAL_SLOTS.length))) throw new Error('Semana inválida.');
    for (const day of week) for (const meal of day) {
      if (meal === null) continue;
      if ('text' in meal) { if (typeof meal.text !== 'string') throw new Error('Comida inválida.'); }
      else { validateRecipe(meal.recipe); if (!Number.isFinite(meal.servings) || meal.servings <= 0 || meal.servings > 1000000) throw new Error('Porciones inválidas.'); }
    }
    // Existing four-slot weeks retain their positions; dessert is appended empty.
    data.weeks[key] = week.map(day => day.length === 4 ? [...day, null] : day);
  }
  if (Object.values(data.purchased).some(value => !Array.isArray(value) || value.some(key => typeof key !== 'string'))) throw new Error('Compras inválidas.');
  return data;
}
