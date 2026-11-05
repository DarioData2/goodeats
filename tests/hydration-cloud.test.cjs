const { test } = require('node:test');
const assert = require('node:assert/strict');
let client;
const localData = new Map();
const localCalls = [];
const supabasePath = require.resolve('../.test-build/lib/supabase.js');
require.cache[supabasePath] = { id: supabasePath, filename: supabasePath, loaded: true, exports: { requireSupabase: () => client } };
const { blankHydration, addWater, undoWater, waterTotal } = require('../.test-build/services/hydrationLogic.js');
const storagePath = require.resolve('../.test-build/services/hydrationStorage.js');
require.cache[storagePath] = { id: storagePath, filename: storagePath, loaded: true, exports: { hydrationStorage: {
  load: async owner => { localCalls.push(['load',owner]); return localData.get(owner) ?? blankHydration(); },
  update: async (owner, change) => { localCalls.push(['update',owner]); const next = change(localData.get(owner) ?? blankHydration()); localData.set(owner,next); return next; },
} } };
const { hydrationService } = require('../.test-build/services/hydrationService.js');
const entry = id => ({ id, ml: 200, at: '2026-11-04T12:00:00.000Z' });
const clone = value => structuredClone(value);
function fake({ user = 'a', row = { payload: blankHydration(), revision: 0 }, readError = false, writeError = false, conflict = false, concurrentInsert, changeUserAt = Infinity } = {}) {
  const calls = []; let state = clone(row), authChecks = 0, conflicted = false;
  localCalls.length = 0; localData.clear();
  client = { auth: { getUser: async () => ({ data: { user: user ? { id: ++authChecks >= changeUserAt ? 'other' : user } : null }, error: null }) }, from: name => {
    assert.equal(name,'hydration_profiles');
    let method='read', body, filters={};
    const query = {
      select: () => query,
      eq: (key,value) => { filters[key]=value; return query; },
      update: input => { method='update'; body=input; return query; },
      upsert: async (input,options) => { calls.push(['insert',clone(input),options]); if (!state) state=clone(concurrentInsert ?? { payload: input.payload, revision: 0 }); return { error: null }; },
      maybeSingle: async () => {
        calls.push([method,clone(filters)]);
        if (method==='read') return { data: readError ? null : clone(state), error: readError ? { code: 'offline' } : null };
        if (writeError) return { data: null, error: { code: 'offline' } };
        if (conflict && !conflicted) { state.payload=addWater(state.payload,'2026-11-04',entry('other-device')); state.revision++; conflicted=true; return { data: null, error: null }; }
        if (filters.revision!==state.revision) return { data: null, error: null };
        state={ payload:clone(body.payload), revision: state.revision+1 };
        return { data:clone(state), error:null };
      },
    }; return query;
  } };
  return { calls, current: () => state };
}
test('guest hydration remains local and never contacts Supabase', async () => {
  client=null; localCalls.length=0; localData.clear();
  await hydrationService.update('local',data=>addWater(data,'2026-11-04',entry('guest')));
  assert.equal(waterTotal((await hydrationService.load('local')).days['2026-11-04']),200);
});
test('cloud hydration requires the correct authenticated account before querying', async () => {
  for (const user of [null,'other']) {
    const db=fake({user});
    await assert.rejects(hydrationService.load('a'));
    await assert.rejects(hydrationService.update('a',data=>data));
    assert.deepEqual(db.calls,[]);
  }
});
test('initial cloud activation copies only the matching account local history', async () => {
  const db=fake({row:null});
  const owned=addWater({...blankHydration(),goalMl:1500},'2026-11-04',entry('old'));
  localData.set('a',owned); localData.set('local',addWater(blankHydration(),'2026-11-04',entry('guest')));
  assert.deepEqual(await hydrationService.load('a'),owned);
  assert.deepEqual(localCalls,[['load','a']]);
  assert.equal(db.calls.find(call=>call[0]==='insert')[2].ignoreDuplicates,true);
  assert.deepEqual(localData.get('a'),owned);
});
test('existing cloud data wins and an initialization race never replaces another device', async () => {
  const remote={...blankHydration(),goalMl:2300};
  fake({row:{payload:remote,revision:4}});
  assert.deepEqual(await hydrationService.load('a'),remote);
  assert.deepEqual(localCalls,[]);
  fake({row:null,concurrentInsert:{payload:remote,revision:4}});
  assert.deepEqual(await hydrationService.load('a'),remote);
});
test('saving on one device can be loaded again; concurrent additions are not lost', async () => {
  const db=fake({conflict:true});
  const saved=await hydrationService.update('a',data=>addWater(data,'2026-11-04',entry('mine')));
  assert.equal(waterTotal(saved.days['2026-11-04']),400);
  assert.deepEqual(await hydrationService.load('a'),saved);
  assert.equal(db.current().revision,2);
  for (const call of db.calls.filter(call=>call[0]==='read'||call[0]==='update')) assert.equal(call[1].user_id,'a');
});
test('read, save and account-change failures cannot silently fall back or overwrite local history', async () => {
  for (const options of [{readError:true},{writeError:true},{changeUserAt:2}]) {
    const db=fake(options);
    const before=clone(db.current());
    await assert.rejects(hydrationService.update('a',data=>({...data,goalMl:2500})));
    assert.deepEqual(db.current(),before);
    assert.deepEqual(localCalls,[]);
  }
});
test('undo refuses to remove an entry added by another device since the screen was loaded', async () => {
  const payload=addWater(addWater(blankHydration(),'2026-11-04',entry('old')),'2026-11-04',entry('new'));
  const db=fake({row:{payload,revision:3}});
  await assert.rejects(hydrationService.update('a',data=>undoWater(data,'2026-11-04','old')));
  assert.deepEqual(db.current().payload,payload);
});
