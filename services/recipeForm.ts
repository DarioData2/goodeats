import { positiveNumber } from './plannerLogic';
export type IngredientDraft = { name: string; quantity: string; unit: string; aisle: string };
export function recipeFormErrors(title: string, servings: string, ingredients: IngredientDraft[]): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!title.trim()) errors.title = 'Escribe el nombre del plato.';
  try { positiveNumber(servings); } catch { errors.servings = 'Indica cuántas porciones rinde la receta, con un número mayor que cero.'; }
  ingredients.forEach((item, index) => {
    if (!item.name.trim()) errors[`name-${index}`] = `Escribe el nombre del ingrediente ${index + 1}.`;
    try { positiveNumber(item.quantity); } catch { errors[`quantity-${index}`] = `Indica una cantidad válida para el ingrediente ${index + 1}, mayor que cero y hasta 1.000.000.`; }
  });
  return errors;
}
