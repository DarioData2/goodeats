const groups = [
  ['tomato', ['tomate', 'tomates']],
  ['carrot', ['zanahoria', 'zanahorias']],
  ['leaf', ['lechuga', 'lechugas', 'espinaca', 'espinacas', 'acelga', 'acelgas', 'repollo', 'repollos']],
  ['fruit', ['manzana', 'manzanas', 'pera', 'peras', 'durazno', 'duraznos', 'naranja', 'naranjas', 'limon', 'limones']],
  ['milk', ['leche', 'yogur', 'yogurt']],
  ['egg', ['huevo', 'huevos']],
  ['cheese', ['queso', 'quesos']],
  ['bread', ['pan', 'panes', 'marraqueta', 'marraquetas', 'hallulla', 'hallullas']],
  ['meat', ['carne', 'carnes', 'bistec', 'bistecs', 'pollo', 'pollos', 'pavo', 'cerdo']],
  ['fish', ['pescado', 'pescados', 'salmon', 'atun', 'merluza', 'sardina', 'sardinas']],
  ['grain', ['arroz', 'avena', 'harina', 'fideos', 'pasta', 'pastas', 'quinoa']],
  ['bean', ['poroto', 'porotos', 'lenteja', 'lentejas', 'garbanzo', 'garbanzos', 'frijol', 'frijoles']],
  ['onion', ['cebolla', 'cebollas', 'ajo', 'ajos']],
] as const;
export type IngredientIconKind = typeof groups[number][0];

export function ingredientIconKind(name: string): IngredientIconKind | null {
  const words = name.toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g, '').split(/[^a-z0-9]+/);
  for (const [kind, aliases] of groups) if (aliases.some(alias => words.includes(alias))) return kind;
  return null;
}
