const { test } = require('node:test');
const assert = require('node:assert/strict');
let client;
const supabasePath = require.resolve('../.test-build/lib/supabase.js');
require.cache[supabasePath] = { id: supabasePath, filename: supabasePath, loaded: true, exports: { requireSupabase: () => client } };
const service = require('../.test-build/services/shoppingService.js');
const auth = require('../.test-build/services/authService.js');
const { toLocalItem } = require('../.test-build/services/cloudShoppingLogic.js');

function fake(results, user = { id: 'owner' }) {
  const calls = [];
  client = {
    auth: { getUser: async () => ({ data: { user }, error: null }) },
    from(table) {
      const result = results.shift();
      assert.ok(result, `unexpected query to ${table}`);
      calls.push(['from', table]);
      const query = {};
      for (const method of ['select', 'eq', 'order', 'insert', 'update', 'delete']) {
        query[method] = (...args) => { calls.push([method, ...args]); return query; };
      }
      query.single = () => Promise.resolve(result);
      query.then = (resolve, reject) => Promise.resolve(result).then(resolve, reject);
      return query;
    },
  };
  return calls;
}
const own = { data: { id: 'list-a' }, error: null };

test('sin sesión no consulta ninguna tabla remota', async () => {
  const calls = fake([], null);
  await assert.rejects(service.getShoppingLists(), issue => issue.code === 'AUTH_REQUIRED');
  assert.deepEqual(calls, []);
});
test('las listas se filtran por el usuario validado', async () => {
  const calls = fake([{ data: [], error: null }]);
  assert.deepEqual(await service.getShoppingLists(), []);
  assert.ok(calls.some(call => call[0] === 'eq' && call[1] === 'user_id' && call[2] === 'owner'));
});
test('una lista ajena impide todas las consultas a productos', async () => {
  const calls = fake([{ data: null, error: { message: 'no rows', code: 'PGRST116' } }]);
  await assert.rejects(service.createShoppingItem({ shopping_list_id: 'foreign', name: 'Pan', quantity: null, unit: null }));
  assert.equal(calls.filter(call => call[0] === 'from').length, 1);
  assert.ok(calls.some(call => call[0] === 'eq' && call[1] === 'user_id' && call[2] === 'owner'));
});
test('editar envía null para quitar cantidad y no permite cambiar propiedad', async () => {
  const calls = fake([own, { data: { id: 'item-a' }, error: null }]);
  await service.updateShoppingItem('list-a', 'item-a', { name: ' Pan ', quantity: null, unit: null, shopping_list_id: 'foreign', id: 'other' });
  const update = calls.find(call => call[0] === 'update')[1];
  assert.equal(update.name, 'Pan'); assert.equal(update.quantity, null); assert.equal(update.unit, null);
  assert.equal(update.shopping_list_id, undefined); assert.equal(update.id, undefined);
  assert.ok(calls.some(call => call[0] === 'eq' && call[1] === 'shopping_list_id' && call[2] === 'list-a'));
  assert.ok(calls.some(call => call[0] === 'eq' && call[1] === 'id' && call[2] === 'item-a'));
});
test('limpieza remota filtra lista y comprado, y propaga errores RLS', async () => {
  const calls = fake([own, { data: null, error: null, count: 2 }]);
  assert.equal(await service.clearPurchasedItems('list-a'), 2);
  assert.ok(calls.some(call => call[0] === 'eq' && call[1] === 'shopping_list_id' && call[2] === 'list-a'));
  assert.ok(calls.some(call => call[0] === 'eq' && call[1] === 'purchased' && call[2] === true));
  fake([own, { data: null, error: { message: 'RLS denied', code: '42501' } }]);
  await assert.rejects(service.clearPurchasedItems('list-a'), issue => issue.code === '42501');
});
test('eliminar un producto no visible no informa éxito', async () => {
  fake([own, { data: null, error: null, count: 0 }]);
  await assert.rejects(service.deleteShoppingItem('list-a', 'missing'));
});
test('convertir filas remotas conserva identidad, comprado y campos vacíos', () => {
  assert.deepEqual(toLocalItem({ id: 'x', shopping_list_id: 'a', name: 'Pan', quantity: null, unit: null, purchased: true, created_at: '2026-10-04T10:00:00Z', updated_at: null }),
    { id: 'x', name: 'Pan', quantity: undefined, unit: undefined, purchased: true, createdAt: '2026-10-04T10:00:00Z' });
});
test('registro sin sesión requiere confirmar correo y logout usa scope local', async () => {
  let received;
  client = { auth: {
    signUp: async input => { received = input; return { data: { session: null }, error: null }; },
    signOut: async input => { received = input; return { error: null }; },
  } };
  assert.equal(await auth.signUp(' user@example.com ', 'password-value'), false);
  assert.deepEqual(received, { email: 'user@example.com', password: 'password-value' });
  await auth.signOut(); assert.deepEqual(received, { scope: 'local' });
});
