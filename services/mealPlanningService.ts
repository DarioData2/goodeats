import AsyncStorage from '@react-native-async-storage/async-storage';
import { requireSupabase } from '../lib/supabase';
import { decodeMenu, menuStorage, type WeeklyMenu } from './menuStorage';
import { decodeRecipe, parseRecipe, type DailyRecipe } from './recipeLogic';

async function account(owner: string) {
  const client = requireSupabase();
  const { data: { user }, error } = await client.auth.getUser();
  if (error || !user || user.id !== owner) throw new Error('Inicia sesión con la cuenta correspondiente.');
  return client;
}
const recipeKey = (owner: string, date: string) => `@goodeats/daily-recipe/v1/${owner}/${date}`;

export async function loadMenu(owner: string, week: string): Promise<WeeklyMenu> {
  if (owner === 'local') return menuStorage.load(owner, week);
  const client = await account(owner);
  const { data, error } = await client.from('weekly_menus').select('meals').eq('user_id', owner).eq('week_start', week).maybeSingle();
  if (error) throw error;
  if (data) return decodeMenu(JSON.stringify(data.meals));
  const local = await menuStorage.load(owner, week);
  if (!local.some(day => day.some(Boolean))) return local;
  // Insert-only migration never overwrites a menu already saved on another device.
  const { error: insertError } = await client.from('weekly_menus').upsert({ user_id: owner, week_start: week, meals: local }, { onConflict: 'user_id,week_start', ignoreDuplicates: true });
  if (insertError) throw insertError;
  return loadMenu(owner, week);
}
export async function saveMenu(owner: string, week: string, menu: WeeklyMenu): Promise<void> {
  const next = decodeMenu(JSON.stringify(menu));
  if (owner === 'local') return menuStorage.save(owner, week, next);
  const client = await account(owner);
  const { error } = await client.from('weekly_menus').upsert({ user_id: owner, week_start: week, meals: next }, { onConflict: 'user_id,week_start' });
  if (error) throw error;
}
export async function loadRecipe(owner: string, date: string): Promise<DailyRecipe> {
  if (owner === 'local') return decodeRecipe(await AsyncStorage.getItem(recipeKey(owner, date)));
  const client = await account(owner);
  const { data, error } = await client.from('daily_recipes').select('title,ingredients,steps').eq('user_id', owner).eq('recipe_date', date).maybeSingle();
  if (error) throw error;
  if (data) return parseRecipe(data);
  const local = decodeRecipe(await AsyncStorage.getItem(recipeKey(owner, date)));
  if (!local.title) return local;
  const { error: insertError } = await client.from('daily_recipes').upsert({ user_id: owner, recipe_date: date, ...local }, { onConflict: 'user_id,recipe_date', ignoreDuplicates: true });
  if (insertError) throw insertError;
  return loadRecipe(owner, date);
}
export async function saveRecipe(owner: string, date: string, recipe: DailyRecipe): Promise<void> {
  const next = parseRecipe(recipe);
  if (owner === 'local') return AsyncStorage.setItem(recipeKey(owner, date), JSON.stringify(next));
  const client = await account(owner);
  const { error } = await client.from('daily_recipes').upsert({ user_id: owner, recipe_date: date, ...next }, { onConflict: 'user_id,recipe_date' });
  if (error) throw error;
}
