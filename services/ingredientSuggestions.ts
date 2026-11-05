const INGREDIENTS = [
  'Manzana', 'Manzana verde', 'Manzana roja', 'Pera', 'Plátano', 'Naranja', 'Limón',
  'Mandarina', 'Frutilla', 'Uva', 'Durazno', 'Palta', 'Tomate', 'Tomate cherry',
  'Zanahoria', 'Lechuga', 'Espinaca', 'Acelga', 'Repollo', 'Brócoli', 'Coliflor',
  'Cebolla', 'Cebollín', 'Ajo', 'Papa', 'Camote', 'Zapallo', 'Zapallo italiano',
  'Pepino', 'Pimentón', 'Champiñones', 'Choclo', 'Arvejas', 'Porotos', 'Lentejas',
  'Garbanzos', 'Arroz', 'Quinoa', 'Avena', 'Harina', 'Fideos', 'Pasta', 'Pan',
  'Marraqueta', 'Hallulla', 'Leche', 'Yogur', 'Queso', 'Quesillo', 'Mantequilla',
  'Crema', 'Huevos', 'Pollo', 'Carne molida', 'Carne de vacuno', 'Cerdo', 'Pavo',
  'Pescado', 'Salmón', 'Atún', 'Merluza', 'Aceite de oliva', 'Aceite', 'Sal',
  'Azúcar', 'Pimienta', 'Orégano', 'Comino', 'Cilantro', 'Perejil', 'Salsa de tomate',
];
function normalize(value: string): string {
  return value.trim().toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}
/** Suggestions never replace text unless explicitly selected. */
export function ingredientSuggestions(query: string): string[] {
  const search = normalize(query);
  if (search.length < 2) return [];
  return INGREDIENTS.filter(name => normalize(name).includes(search))
    .sort((a, b) => Number(!normalize(a).startsWith(search)) - Number(!normalize(b).startsWith(search))).slice(0, 5);
}
