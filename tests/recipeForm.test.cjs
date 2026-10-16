const { test } = require('node:test');
const assert = require('node:assert/strict');
const { recipeFormErrors } = require('../.test-build/services/recipeForm.js');
const ingredient = { name: 'Tomate', quantity: '1,5', unit: 'kg', aisle: 'Frutas y verduras' };
test('el formulario identifica errores en orden de lectura y distingue ingredientes', () => {
  const errors = recipeFormErrors('', '0', [{ ...ingredient, name: '', quantity: '' }, { ...ingredient, quantity: '-1' }]);
  assert.deepEqual(Object.keys(errors), ['title', 'servings', 'name-0', 'quantity-0', 'quantity-1']);
  assert.match(errors['quantity-1'], /ingrediente 2/);
});
test('las cantidades decimales con coma y datos completos no generan errores', () => {
  assert.deepEqual(recipeFormErrors('Ensalada', '2', [ingredient]), {});
});
test('se identifican cantidades fuera de rango sin perder el resto del formulario', () => {
  const errors = recipeFormErrors('Ensalada', '2', [{ ...ingredient, quantity: '1000001' }]);
  assert.deepEqual(Object.keys(errors), ['quantity-0']);
  assert.equal(ingredient.quantity, '1,5');
});
