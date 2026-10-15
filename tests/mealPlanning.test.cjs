const { test } = require('node:test');
const assert = require('node:assert/strict');
let client;
const local = new Map();
const stub = (path, exports) => {
  const id = require.resolve(path);
  require.cache[id] = { id, filename: id, loaded: true, exports };
};
stub('../.test-build/lib/supabase.js', { requireSupabase: () => client });
stub('@react-native-async-storage/async-storage', { __esModule: true, default: {
  getItem: async key => local.get(key) ?? null,
  setItem: async (key, value) => { local.set(key, value); },
} });
const service = require('../.test-build/services/mealPlanningService.js');
function fake(results, owner = 'owner') {
  const calls = [];
  client = { auth: { getUser: async () => ({ data: { user: owner ? { id: owner } : null }, error: null }) },
    from(table) {
      const result = results.shift(); assert.ok(result, `consulta inesperada: ${table}`);
      calls.push(['from', table]); const q = {};
      for (const method of ['select', 'eq', 'upsert']) q[method] = (...args) => { calls.push([method, ...args]); return q; };
      q.maybeSingle = () => Promise.resolve(result);
      q.then = (resolve, reject) => Promise.resolve(result).then(resolve, reject);
      return q;
    } };
  return calls;
}
test('menús y recetas bloquean otra cuenta antes de consultar', async () => {
  const calls = fake([], 'other');
  await assert.rejects(service.loadMenu('owner', '2026-10-12'));
  await assert.rejects(service.saveRecipe('owner', '2026-10-14', { title: 'Pan', ingredients: '', steps: '' }));
  assert.deepEqual(calls, []);
});
test('recetas locales funcionan sin consultar Supabase', async () => {
  const calls = fake([], null);
  await service.saveRecipe('local', '2026-10-14', { title: ' Pan ', ingredients: '', steps: '' });
  assert.equal((await service.loadRecipe('local', '2026-10-14')).title, 'Pan');
  assert.deepEqual(calls, []);
});
test('lectura remota filtra propietario y fecha; no sustituye una receta remota con local', async () => {
  local.set('@goodeats/daily-recipe/v1/owner/2026-10-14', JSON.stringify({ title: 'Local', ingredients: '', steps: '' }));
  const calls = fake([{ data: { title: 'Nube', ingredients: '', steps: '' }, error: null }]);
  assert.equal((await service.loadRecipe('owner', '2026-10-14')).title, 'Nube');
  assert.ok(calls.some(c => c[0] === 'eq' && c[1] === 'user_id' && c[2] === 'owner'));
  assert.ok(calls.some(c => c[0] === 'eq' && c[1] === 'recipe_date' && c[2] === '2026-10-14'));
  assert.ok(!calls.some(c => c[0] === 'upsert'));
});
test('migración local ignora conflictos y devuelve el registro confirmado', async () => {
  const calls = fake([{ data: null, error: null }, { error: null }, { data: { title: 'Otro dispositivo', ingredients: '', steps: '' }, error: null }]);
  assert.equal((await service.loadRecipe('owner', '2026-10-14')).title, 'Otro dispositivo');
  assert.equal(calls.find(c => c[0] === 'upsert')[2].ignoreDuplicates, true);
});
test('fallos remotos se propagan sin sobrescribir el respaldo local', async () => {
  const before = local.get('@goodeats/daily-recipe/v1/owner/2026-10-14');
  fake([{ error: new Error('RLS') }]);
  await assert.rejects(service.saveRecipe('owner', '2026-10-14', { title: 'Cambio', ingredients: '', steps: '' }));
  assert.equal(local.get('@goodeats/daily-recipe/v1/owner/2026-10-14'), before);
});
test('menús se guardan por cuenta y semana con validación del formato', async () => {
  const menu = Array.from({ length: 7 }, () => ['', 'Sopa', '']);
  const calls = fake([{ error: null }]);
  await service.saveMenu('owner', '2026-10-12', menu);
  assert.deepEqual(calls.find(c => c[0] === 'upsert')[1], { user_id: 'owner', week_start: '2026-10-12', meals: menu });
  fake([]);
  await assert.rejects(service.saveMenu('owner', '2026-10-12', [['Sopa']]));
});
