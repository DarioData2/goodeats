// Regression cases from the shopping QA review; included in npm test.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { parseItemInput } = require('../.test-build/services/shoppingLogic.js');
const { formatQuantity, roundQuantity } = require('../.test-build/services/quantities.js');
const { blankWeek, validateRecipe, generateGroceries } = require('../.test-build/services/plannerLogic.js');

test('QA-02: una cantidad manual aceptada no debe mostrarse como cero', () => {
  const item = parseItemInput('Azafrán', '0,0001', 'kg');
  assert.equal(formatQuantity(item.quantity), '0,0001');
});

test('QA-03: una cantidad positiva escalada no debe convertirse en cero', () => {
  const recipe = validateRecipe({ id: 'qa', title: 'Preparación de prueba', category: 'Pruebas', servings: 1000,
    ingredients: [{ name: 'Especia', quantity: 0.0001, unit: 'g', aisle: 'Despensa' }], steps: '' });
  const week = blankWeek();
  week[0][1] = { recipe, servings: 1 };
  const result = generateGroceries(week).items[0];
  assert.ok(result.quantity > 0, `Cantidad esperada: 0.0000001 g; obtenida: ${result.quantity} g`);
  assert.equal(result.quantity, 0.0000001);
  assert.equal(formatQuantity(result.quantity), '0,0000001');
});

test('las sumas decimales no muestran ruido de coma flotante', () => {
  assert.equal(roundQuantity(0.1 + 0.2), 0.3);
  assert.equal(formatQuantity(0.1 + 0.2), '0,3');
  assert.equal(formatQuantity(1.23456789), '1,23456789');
});

test('formatear cantidades pequeñas conserva su magnitud', () => {
  for (const quantity of [0.000000000001, 0.0001, 0.1, 1, 999999.123456]) {
    const formatted = formatQuantity(quantity).replaceAll('.', '').replace(',', '.');
    assert.equal(Number(formatted), quantity);
  }
});
