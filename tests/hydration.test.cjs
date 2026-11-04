const { test } = require('node:test');
const assert = require('node:assert/strict');
const values = new Map();
let readFails = false, writeFails = false;
const storagePath = require.resolve('@react-native-async-storage/async-storage');
require.cache[storagePath] = { id: storagePath, filename: storagePath, loaded: true, exports: { __esModule: true, default: {
  getItem: async key => { if (readFails) throw new Error('offline'); return values.get(key) ?? null; },
  setItem: async (key, value) => { if (writeFails) throw new Error('full'); values.set(key, value); },
} } };
const { blankHydration, decodeHydration, waterAmount, waterTotal, addWater, undoWater, bottleLevel, BOTTLE_CAPACITY_ML, litersToMl, formatLiters, waterBottles } = require('../.test-build/services/hydrationLogic.js');
const { hydrationStorage, hydrationKey } = require('../.test-build/services/hydrationStorage.js');
const entry = (id, ml = 250) => ({ id, ml, at: '2026-11-03T15:00:00.000Z' });

test('hydration starts with no prescribed goal and validates integer ml amounts', () => {
  assert.deepEqual(decodeHydration(null), { version: 1, goalMl: null, days: {} });
  assert.equal(waterAmount(' 250 '), 250);
  for (const value of ['', '0', '-1', '1.5', '1,5', 'NaN', 'Infinity', '10001', '2 litros']) assert.throws(() => waterAmount(value));
});
test('five 200 ml entries fill the one litre bottle; excess remains in the daily total', () => {
  assert.equal(BOTTLE_CAPACITY_ML, 1000);
  let data = blankHydration();
  for (let index = 1; index <= 6; index++) {
    data = addWater(data, '2026-11-03', entry(`bottle-${index}`, 200));
    const total = waterTotal(data.days['2026-11-03']);
    assert.equal(total, index * 200);
    assert.equal(bottleLevel(total), Math.min(index * 200, 1000));
  }
  const restored = decodeHydration(JSON.stringify(data));
  assert.equal(waterTotal(restored.days['2026-11-03']), 1200);
  assert.equal(bottleLevel(waterTotal(undoWater(undoWater(restored, '2026-11-03'), '2026-11-03').days['2026-11-03'])), 800);
  assert.equal(bottleLevel(0), 0);
});
test('litre goals accept decimal comma and preserve millilitre precision', () => {
  for (const [value, ml] of [['1',1000], ['1,5',1500], ['2.25',2250], ['0,001',1], ['10',10000]]) {
    assert.equal(litersToMl(value), ml);
    assert.equal(litersToMl(formatLiters(ml)), ml);
  }
  for (const value of ['', '0', '-1', '1,0001', '1.5 litros', 'NaN', 'Infinity', '10,001']) assert.throws(() => litersToMl(value));
});
test('additional bottles distinguish completed litres, the current fill and planned goal', () => {
  assert.deepEqual(waterBottles(0).bottles, [{ number: 1, ml: 0 }]);
  assert.deepEqual(waterBottles(1000).bottles, [{ number: 1, ml: 1000 }, { number: 2, ml: 0 }]);
  assert.deepEqual(waterBottles(1200).bottles, [{ number: 1, ml: 1000 }, { number: 2, ml: 200 }]);
  assert.deepEqual(waterBottles(2000).bottles, [{ number: 1, ml: 1000 }, { number: 2, ml: 1000 }, { number: 3, ml: 0 }]);
  assert.deepEqual(waterBottles(400, 2500).bottles, [{ number: 1, ml: 400 }, { number: 2, ml: 0 }, { number: 3, ml: 0 }]);
  const many = waterBottles(25000);
  assert.equal(many.bottles.length, 12);
  assert.equal(many.completedBefore * 1000 + many.bottles.reduce((sum, b) => sum + b.ml, 0), 25000);
});
test('editing litre goals and undoing water keep existing daily records intact', () => {
  const data = addWater(blankHydration(), '2026-11-03', entry('existing', 1200));
  const updated = decodeHydration(JSON.stringify({ ...data, goalMl: litersToMl('2,5') }));
  assert.deepEqual(updated.days, data.days);
  assert.equal(updated.goalMl, 2500);
  assert.equal(waterBottles(waterTotal(updated.days['2026-11-03']), updated.goalMl).bottles[1].ml, 200);
  assert.equal(waterTotal(undoWater(updated, '2026-11-03').days['2026-11-03']), 0);
});
test('daily totals persist across reload, midnight and week boundaries', () => {
  let data = addWater(blankHydration(), '2026-11-01', entry('a', 150));
  data = addWater(data, '2026-11-01', entry('b', 500));
  data = addWater(data, '2026-11-02', entry('c', 250));
  const restored = decodeHydration(JSON.stringify(data));
  assert.equal(waterTotal(restored.days['2026-11-01']), 650);
  assert.equal(waterTotal(restored.days['2026-11-02']), 250);
  assert.deepEqual(restored, data);
});
test('changing a goal preserves records; undo removes only the latest entry of that day', () => {
  let data = addWater(blankHydration(), '2026-11-03', entry('a'));
  data = addWater(data, '2026-11-03', entry('b', 500));
  data = addWater(data, '2026-11-02', entry('c', 150));
  data = decodeHydration(JSON.stringify({ ...data, goalMl: 1700 }));
  const next = undoWater(data, '2026-11-03');
  assert.equal(next.goalMl, 1700);
  assert.deepEqual(next.days['2026-11-03'], [entry('a')]);
  assert.equal(next.days['2026-11-02'][0].ml, 150);
  assert.equal(data.days['2026-11-03'].length, 2);
});
test('corrupt records, invalid calendar dates and duplicate entries are rejected', () => {
  for (const raw of ['{broken', 'null', '{"version":2}', JSON.stringify({ ...blankHydration(), goalMl: '2000' }),
    JSON.stringify({ ...blankHydration(), days: { '2026-02-30': [] } }),
    JSON.stringify({ ...blankHydration(), days: { '2026-11-03': [entry('a'), entry('a')] } }),
    JSON.stringify({ ...blankHydration(), days: { '2026-11-03': [{ ...entry('a'), ml: '250' }] } }),
  ]) assert.throws(() => decodeHydration(raw));
});
test('local, account A and account B have isolated records and goals', async () => {
  values.clear();
  await hydrationStorage.update('user-a', data => addWater({ ...data, goalMl: 1500 }, '2026-11-03', entry('a')));
  await hydrationStorage.update('local', data => addWater(data, '2026-11-03', entry('b', 500)));
  assert.deepEqual(await hydrationStorage.load('user-b'), blankHydration());
  assert.equal((await hydrationStorage.load('user-a')).goalMl, 1500);
  assert.equal(waterTotal((await hydrationStorage.load('local')).days['2026-11-03']), 500);
  assert.notEqual(hydrationKey('user-a'), hydrationKey('local'));
});
test('read, validation and write failures do not overwrite stored hydration records', async () => {
  const key = hydrationKey('user-a');
  const original = values.get(key);
  readFails = true;
  await assert.rejects(hydrationStorage.update('user-a', () => blankHydration()));
  readFails = false; assert.equal(values.get(key), original);
  await assert.rejects(hydrationStorage.update('user-a', data => ({ ...data, goalMl: -1 })));
  assert.equal(values.get(key), original);
  writeFails = true;
  await assert.rejects(hydrationStorage.update('user-a', data => ({ ...data, goalMl: 2000 })));
  writeFails = false; assert.equal(values.get(key), original);
});
