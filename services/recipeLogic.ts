export type DailyRecipe = { title: string; ingredients: string; steps: string };
export const emptyRecipe = (): DailyRecipe => ({ title: '', ingredients: '', steps: '' });
export function parseRecipe(recipe: DailyRecipe): DailyRecipe {
  const next = { title: recipe.title.trim(), ingredients: recipe.ingredients.trim(), steps: recipe.steps.trim() };
  if (!next.title && (next.ingredients || next.steps)) throw new Error('Escribe el nombre del plato.');
  if (next.title.length > 120 || next.ingredients.length > 4000 || next.steps.length > 6000) throw new Error('La receta supera el tamaño permitido.');
  return next;
}
export function decodeRecipe(raw: string | null): DailyRecipe {
  if (raw === null) return emptyRecipe();
  const data: unknown = JSON.parse(raw);
  if (!data || typeof data !== 'object' || !('title' in data) || typeof data.title !== 'string' ||
    !('ingredients' in data) || typeof data.ingredients !== 'string' || !('steps' in data) || typeof data.steps !== 'string') {
    throw new Error('Formato de receta inválido.');
  }
  return parseRecipe({ title: data.title, ingredients: data.ingredients, steps: data.steps });
}
export function recipeLines(text: string): string[] { return text.split('\n').map(line => line.trim()).filter(Boolean); }
