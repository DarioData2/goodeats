const { test } = require('node:test');
const assert = require('node:assert/strict');
let client;
const supabasePath = require.resolve('../.test-build/lib/supabase.js');
require.cache[supabasePath] = { id: supabasePath, filename: supabasePath, loaded: true, exports: { requireSupabase: () => client } };
const { readProfile, saveProfile, getAvatarUrl } = require('../.test-build/services/profileService.js');
const { validateProfileNames, avatarPath, validateAvatar, profileNames, MAX_AVATAR_BYTES } = require('../.test-build/services/profileLogic.js');
const { signUp } = require('../.test-build/services/authService.js');
const owner = 'user-a';
const names = { firstName: ' María José ', lastName: ' Pérez-Gómez ' };
const image = { bytes: Uint8Array.from([255,216,255,224,0,1]).buffer, filename: 'new-photo.jpg' };
function fake({ user = { id: owner, user_metadata: { avatar_path: `${owner}/old.jpg` } }, uploadError = null, updateError = null, secondUser, removeError = false } = {}) {
  const calls = []; let checks = 0;
  const bucket = {
    upload: async (...args) => { calls.push(['upload', ...args]); return { error: uploadError }; },
    remove: async paths => { calls.push(['remove', paths]); if (removeError) throw new Error('offline'); return { error: null }; },
    createSignedUrl: async (...args) => { calls.push(['sign', ...args]); return { data: { signedUrl: 'https://example.test/signed-photo' }, error: null }; },
  };
  client = {
    auth: {
      getUser: async () => ({ data: { user: ++checks > 1 && secondUser !== undefined ? secondUser : user }, error: null }),
      updateUser: async data => { calls.push(['update', data]); return { data: { user: user ? { ...user, user_metadata: { ...user.user_metadata, ...data.data } } : null }, error: updateError }; },
    },
    storage: { from: name => { assert.equal(name, 'profile-avatars'); return bucket; } },
  };
  return calls;
}
test('nombres admiten acentos, espacios e identidades existentes sin perfil', () => {
  assert.deepEqual(validateProfileNames(names), { firstName: 'María José', lastName: 'Pérez-Gómez' });
  assert.deepEqual(profileNames(), { firstName: '', lastName: '' });
  for (const input of [{ ...names, firstName: '' }, { ...names, lastName: ' ' }, { ...names, firstName: 'x'.repeat(81) }, { ...names, lastName: 'A\nB' }]) assert.throws(() => validateProfileNames(input));
});
test('rutas privadas no admiten otra cuenta ni URLs externas', () => {
  assert.equal(avatarPath(owner, { avatar_path: `${owner}/photo.jpg` }), `${owner}/photo.jpg`);
  for (const path of ['user-b/photo.jpg', `${owner}/../photo.jpg`, 'https://other.test/a.jpg', `${owner}/photo.svg`]) assert.equal(avatarPath(owner, { avatar_path: path }), null);
});
test('fotos comprueban tamaño y firma JPEG antes de subir', () => {
  validateAvatar(image.bytes);
  assert.throws(() => validateAvatar(new ArrayBuffer(0)));
  assert.throws(() => validateAvatar(Uint8Array.from([137,80,78,71]).buffer));
  assert.throws(() => validateAvatar(new ArrayBuffer(MAX_AVATAR_BYTES + 1)));
});
test('sin sesión o con cuenta distinta no modifica perfil ni almacenamiento', async () => {
  for (const user of [null, { id: 'user-b', user_metadata: {} }]) {
    const calls = fake({ user });
    await assert.rejects(saveProfile(owner, names, image));
    assert.deepEqual(calls, []);
  }
});
test('guardar nombres conserva foto, sin subir imágenes ni tocar contraseñas', async () => {
  const calls = fake(); await saveProfile(owner, names, undefined);
  assert.deepEqual(calls, [['update', { data: { first_name: 'María José', last_name: 'Pérez-Gómez', avatar_path: `${owner}/old.jpg` } }]]);
});
test('foto nueva se sube privada y se enlaza antes de limpiar la anterior', async () => {
  const calls = fake(); await saveProfile(owner, names, image);
  assert.deepEqual(calls.map(c => c[0]), ['upload', 'update', 'remove']);
  assert.equal(calls[0][1], `${owner}/new-photo.jpg`);
  assert.equal(calls[0][3].upsert, false);
  assert.equal(calls[1][1].data.avatar_path, `${owner}/new-photo.jpg`);
  assert.deepEqual(calls[2][1], [`${owner}/old.jpg`]);
});
test('subida fallida no informa guardado ni altera nombres o foto previa', async () => {
  const calls = fake({ uploadError: { message: 'bucket missing' } });
  await assert.rejects(saveProfile(owner, names, image));
  assert.deepEqual(calls.map(c => c[0]), ['upload']);
});
test('fallo de perfil limpia solo la foto nueva; cambio de sesión bloquea actualización', async () => {
  for (const failure of [{ updateError: { message: 'offline' } }, { secondUser: { id: 'other', user_metadata: {} } }]) {
    const calls = fake(failure); await assert.rejects(saveProfile(owner, names, image));
    assert.deepEqual(calls.filter(c => c[0] === 'remove').map(c => c[1]), [[`${owner}/new-photo.jpg`]]);
    if (failure.secondUser) assert.equal(calls.some(c => c[0] === 'update'), false);
  }
});
test('quitar foto actualiza referencia y tolera fallo de limpieza tras guardar', async () => {
  const calls = fake({ removeError: true }); await saveProfile(owner, names, null);
  assert.equal(calls[0][1].data.avatar_path, null);
  assert.equal(calls[1][0], 'remove');
});
test('firmar foto valida propietario y usa URL temporal', async () => {
  const calls = fake();
  assert.equal(await getAvatarUrl(owner, `${owner}/photo.jpg`), 'https://example.test/signed-photo');
  assert.deepEqual(calls, [['sign', `${owner}/photo.jpg`, 3600]]);
  await assert.rejects(getAvatarUrl(owner, 'other/photo.jpg'));
});
test('registro envía nombre y apellido sin almacenar contraseña como metadato', async () => {
  let request;
  client = { auth: { signUp: async body => { request = body; return { data: { session: null }, error: null }; } } };
  assert.equal(await signUp(' me@example.test ', 'test-password', names), false);
  assert.deepEqual(request.options.data, { first_name: 'María José', last_name: 'Pérez-Gómez' });
  assert.equal(request.email, 'me@example.test');
});
test('editar recupera nombres guardados del servidor; vaciar un campo no modifica la cuenta', async () => {
  const stored = { id: owner, user_metadata: { first_name: 'María José', last_name: 'Pérez-Gómez' } };
  const calls = fake({ user: stored });
  assert.deepEqual(profileNames((await readProfile(owner)).user_metadata), { firstName: 'María José', lastName: 'Pérez-Gómez' });
  await assert.rejects(saveProfile(owner, { firstName: '', lastName: 'Pérez-Gómez' }, undefined));
  assert.deepEqual(calls, []);
  assert.equal(stored.user_metadata.first_name, 'María José');
});
test('guardar devuelve los nombres confirmados para actualizar sesión y precargar siguiente edición', async () => {
  fake();
  const saved = await saveProfile(owner, names, undefined);
  assert.deepEqual(profileNames(saved.user_metadata), { firstName: 'María José', lastName: 'Pérez-Gómez' });
});
test('lectura fallida u otra cuenta no se usa como perfil vacío', async () => {
  for (const user of [null, { id: 'other', user_metadata: { first_name: 'Otro' } }]) {
    fake({ user }); await assert.rejects(readProfile(owner));
  }
});
