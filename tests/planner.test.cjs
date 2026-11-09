const { test } = require('node:test');
const assert = require('node:assert/strict');
const { blankWeek, blankPlanner, generateGroceries, positiveNumber, validateRecipe, decodePlanner, purchaseKey, MEAL_SLOTS, planFromLegacyMenu, updatePantry } = require('../.test-build/services/plannerLogic.js');
const recipe = (ingredients) => ({ id: 'one', title: 'Ensalada', category: 'Ensaladas', servings: 2, ingredients, steps: 'Mezclar.' });
const ingredient = (name, quantity, unit = 'g', aisle = 'Frutas y verduras') => ({ name, quantity, unit, aisle });
test('scales portions, sums repeated ingredients across all meal slots and converts compatible units', () => {
  const week = blankWeek();
  week[0][0] = { recipe: recipe([ingredient('Tomate', 250)]), servings: 4 };
  week[1][3] = { recipe: recipe([ingredient(' tomate ', 1, 'kg')]), servings: 2 };
  const result = generateGroceries(week);
  assert.equal(result.items.length, 1);
  assert.equal(result.items[0].quantity, 1500);
  assert.equal(result.items[0].unit, 'g');
});
test('keeps incompatible units distinct and warns about unlinked legacy meals', () => {
  const week = blankWeek();
  week[0][1] = { recipe: recipe([ingredient('Tomate', 2, 'unidad'), ingredient('Tomate', 200)]), servings: 2 };
  week[0][2] = { text: 'Sopa antigua' };
  const result = generateGroceries(week);
  assert.equal(result.items.length, 2);
  assert.equal(result.unlinked, 1);
});
test('normalizes accents and categories without merging different preparations', () => {
  const week = blankWeek();
  week[0][1] = { recipe: recipe([ingredient('Limón', 1, 'unidad'), ingredient('limon', 2, 'unidad', 'Otros'), ingredient('Limón exprimido', 1, 'unidad')]), servings: 2 };
  assert.deepEqual(generateGroceries(week).items.map(item => item.quantity), [3, 1]);
});
test('purchase state changes identity when required quantity changes', () => {
  const week = blankWeek();
  week[0][1] = { recipe: recipe([ingredient('Leche', 1, 'litro', 'Lácteos y huevos')]), servings: 2 };
  const first = generateGroceries(week).items[0];
  assert.equal(first.quantity, 1000);
  week[0][1].servings = 4;
  assert.notEqual(purchaseKey(first), purchaseKey(generateGroceries(week).items[0]));
});
test('rejects invalid numeric input and recipes instead of silently dropping ingredients', () => {
  assert.equal(positiveNumber('1,5'), 1.5);
  for (const value of ['', '0', '-1', 'NaN', '2 huevos', 'Infinity', '1000001']) assert.throws(() => positiveNumber(value));
  assert.throws(() => validateRecipe(recipe([])));
  assert.throws(() => validateRecipe(recipe([ingredient('Arroz', -1)])));
});
test('validates stored data, preserves snapshots and rejects malformed weeks', () => {
  const data = blankPlanner();
  const week = blankWeek();
  week[0][1] = { recipe: recipe([ingredient('Arroz', 200, 'g', 'Despensa')]), servings: 1 };
  data.weeks['2026-10-12'] = week;
  assert.deepEqual(decodePlanner(JSON.stringify(data)), data);
  assert.throws(() => decodePlanner('{broken'));
  data.weeks['2026-10-12'][0].pop();
  data.weeks['2026-10-12'][0].pop();
  assert.throws(() => decodePlanner(JSON.stringify(data)));
});

test('existing four-slot weeks preserve all meals and purchases when adding desserts', () => {
  const data = blankPlanner();
  const previous = Array.from({ length: 7 }, () => Array(4).fill(null));
  previous[0][0] = { text: 'Avena' };
  previous[0][1] = { recipe: recipe([ingredient('Arroz', 200)]), servings: 2 };
  previous[0][2] = { text: 'Sopa' };
  previous[0][3] = { text: 'Fruta' };
  data.weeks['2026-10-12'] = previous;
  data.purchased['2026-10-12'] = ['existing-purchase'];
  const restored = decodePlanner(JSON.stringify(data));
  assert.deepEqual(restored.weeks['2026-10-12'][0], [...previous[0], null]);
  assert.deepEqual(restored.purchased, data.purchased);
  assert.deepEqual(decodePlanner(JSON.stringify(restored)), restored);
});

test('desserts persist, scale ingredients and contribute to automatic groceries', () => {
  assert.deepEqual(MEAL_SLOTS, ['Desayuno', 'Almuerzo', 'Cena', 'Snacks', 'Postres']);
  const data = blankPlanner();
  const week = blankWeek();
  week[0][4] = { recipe: recipe([ingredient('Leche', 250, 'ml', 'Lácteos y huevos')]), servings: 4 };
  week[0][0] = { recipe: recipe([ingredient('Leche', 100, 'ml', 'Lácteos y huevos')]), servings: 2 };
  data.weeks['2026-10-12'] = week;
  const restored = decodePlanner(JSON.stringify(data));
  assert.deepEqual(restored.weeks['2026-10-12'], week);
  assert.equal(generateGroceries(restored.weeks['2026-10-12']).items[0].quantity, 600);
  assert.equal(week[1][4], null);
});

test('recovering a legacy menu keeps breakfast, lunch and dinner in their original slots', () => {
  const old = Array.from({ length: 7 }, () => ['Avena', 'Arroz', 'Sopa']);
  const week = planFromLegacyMenu(old);
  assert.deepEqual(week[0], [{ text: 'Avena' }, { text: 'Arroz' }, { text: 'Sopa' }, null, null]);
  assert.equal(week.length, 7);
  assert.deepEqual(old[0], ['Avena', 'Arroz', 'Sopa']);
});

test('stock covers weekly requirements once across meals, matching compatible units and names', () => {
  const week = blankWeek();
  week[0][1] = { recipe: recipe([ingredient('Limón', 350), ingredient('Leche', 500, 'ml')]), servings: 2 };
  week[1][1] = { recipe: recipe([ingredient('Limón', 300), ingredient('Limón', 2, 'unidad')]), servings: 2 };
  const stock = [ingredient(' limon ', 0.5, 'kg'), ingredient('Leche', 1, 'litro')];
  const result = generateGroceries(week, stock);
  assert.equal(result.covered, 1);
  assert.deepEqual(result.items.map(({ name, unit, quantity }) => [name, unit, quantity]), [['Limón', 'g', 150], ['Limón', 'unidad', 2]]);
  assert.equal(generateGroceries(week).items.find(item => item.name === 'Limón' && item.unit === 'g').quantity, 650);
});

test('changing stock resets only changed purchase amounts and preserves weeks after reload', () => {
  const data = blankPlanner();
  const week = blankWeek();
  week[0][1] = { recipe: recipe([ingredient('Tomate', 500), ingredient('Pan', 2, 'unidad')]), servings: 2 };
  const date = '2026-10-12';
  data.weeks[date] = week;
  const original = generateGroceries(week).items;
  data.purchased[date] = original.map(purchaseKey);
  const restored = decodePlanner(JSON.stringify(updatePantry(data, [ingredient('Tomate', 200)])));
  assert.deepEqual(restored.purchased[date], [purchaseKey(original.find(item => item.name === 'Pan'))]);
  assert.deepEqual(restored.weeks, data.weeks);
  assert.deepEqual(restored.pantry, [{ name: 'Tomate', quantity: 200, unit: 'g' }]);
  assert.throws(() => decodePlanner(JSON.stringify({ ...restored, pantry: [...restored.pantry, ingredient(' tomate ', 0.2, 'kg')] })), /duplicados/);
});
