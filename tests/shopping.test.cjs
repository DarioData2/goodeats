const { test } = require('node:test');
const assert = require('node:assert/strict');
const { parseItemInput, updateItem, toggleItem, clearPurchased, decodeItems } = require('../.test-build/services/shoppingLogic.js');
const tomato = { id: 'tomato', name: 'Tomates', quantity: 6, unit: 'unidad', purchased: false, createdAt: '2026-10-04T12:00:00Z' };
const milk = { ...tomato, id: 'milk', name: 'Leche', quantity: 2, unit: 'litro', purchased: true };

test('requiere nombre y admite cantidad opcional o decimal con coma', () => {
  assert.throws(() => parseItemInput('  ', '1', 'kg'));
  assert.deepEqual(parseItemInput(' Pollo ', '1,5', 'kg'), { name: 'Pollo', quantity: 1.5, unit: 'kg' });
  assert.equal(parseItemInput('Pan', '', 'unidad').quantity, undefined);
  for (const value of ['0', '-1', 'abc', 'Infinity', '1.2.3', '1e3', '0x10']) assert.throws(() => parseItemInput('Pan', value, 'kg'));
});
test('editar conserva identidad, fecha y estado y permite quitar cantidad', () => {
  const result = updateItem([milk], milk.id, parseItemInput('Leche descremada', '', 'caja'))[0];
  assert.deepEqual(result, { ...milk, name: 'Leche descremada', quantity: undefined, unit: 'caja' });
  assert.equal(milk.name, 'Leche');
});
test('marcar y desmarcar no cambia otros productos', () => {
  const result = toggleItem([tomato, milk], tomato.id);
  assert.equal(result[0].purchased, true);
  assert.equal(result[1], milk);
  assert.deepEqual(toggleItem(result, tomato.id), [tomato, milk]);
});
test('limpiar elimina exclusivamente comprados', () => {
  assert.deepEqual(clearPurchased([tomato, milk]), [tomato]);
  assert.deepEqual(clearPurchased([milk]), []);
});
test('la lista completa sobrevive a serialización, edición y limpieza', () => {
  let items = decodeItems(JSON.stringify([tomato, milk]));
  items = updateItem(items, tomato.id, parseItemInput('Tomates cherry', '0,5', 'kg'));
  items = clearPurchased(items);
  assert.deepEqual(decodeItems(JSON.stringify(items)), [{ ...tomato, name: 'Tomates cherry', quantity: 0.5, unit: 'kg' }]);
  assert.deepEqual(decodeItems(null), []);
});
test('datos corruptos o incompatibles se rechazan antes de escribir', () => {
  for (const raw of ['{', '{}', '[null]', JSON.stringify([tomato, tomato]), JSON.stringify([{ ...tomato, purchased: 'false' }]), JSON.stringify([{ ...tomato, quantity: -1 }]), JSON.stringify([{ ...tomato, createdAt: 'ayer' }])]) {
    assert.throws(() => decodeItems(raw));
  }
});
