const { test } = require('node:test');
const assert = require('node:assert/strict');
const { parseVideoUrl, validateVideoSource } = require('../.test-build/services/videoRecipes.js');
const { blankPlanner, blankWeek, addSavedVideo, completeSavedVideo, decodePlanner, generateGroceries, validateRecipe } = require('../.test-build/services/plannerLogic.js');
const youtube = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
const bookmark = { id: 'video-1', title: 'Sopa del video', source: { ...parseVideoUrl(youtube), author: 'Canal de cocina' } };
const recipe = { id: 'video-1', title: 'Sopa', category: 'Sopas', servings: 2, ingredients: [{ name: 'Tomate', quantity: 250, unit: 'g', aisle: 'Frutas y verduras' }], steps: 'Cocinar.' };

test('YouTube watch, Shorts, live y enlace compartido tienen una identidad sin rastreo', () => {
  for (const url of [youtube, 'https://youtu.be/dQw4w9WgXcQ?si=tracking&t=20', 'https://m.youtube.com/shorts/dQw4w9WgXcQ', 'https://youtube.com/live/dQw4w9WgXcQ#fragment']) assert.equal(parseVideoUrl(url).url, youtube);
});
test('TikTok acepta videos y enlaces cortos sin resolver ni descargar contenido', () => {
  assert.equal(parseVideoUrl('https://www.tiktok.com/@cocina/video/7421234567890123456?is_from_webapp=1').url, 'https://www.tiktok.com/@cocina/video/7421234567890123456');
  for (const url of ['https://vm.tiktok.com/ZM123abc/', 'https://vt.tiktok.com/ZS123abc/', 'https://www.tiktok.com/t/ZT123abc/']) assert.equal(parseVideoUrl(url).platform, 'TikTok');
});
test('rechaza otras fuentes, URLs peligrosas, páginas sin video y dominios suplantados', () => {
  for (const url of ['javascript:alert(1)', 'http://youtu.be/dQw4w9WgXcQ', 'https://youtube.com.evil.test/watch?v=dQw4w9WgXcQ', 'https://youtube.com@evil.test/watch?v=dQw4w9WgXcQ', 'https://user:pass@youtube.com/watch?v=dQw4w9WgXcQ', 'https://127.0.0.1/video', 'https://youtu.be:444/dQw4w9WgXcQ', 'https://youtube.com/playlist?list=abc', 'https://tiktok.com/@cocina', 'https://instagram.com/reel/abc', 'https://youtu.be/invalid', 'https://youtube.com\\@evil.test/watch?v=dQw4w9WgXcQ']) assert.throws(() => parseVideoUrl(url), url);
  assert.throws(() => validateVideoSource({ url: youtube, platform: 'TikTok' }));
});
test('datos antiguos siguen cargando; enlaces pendientes sobreviven a recarga y no generan compras', () => {
  const old = blankPlanner();
  assert.deepEqual(decodePlanner(JSON.stringify(old)), old);
  const next = addSavedVideo(old, bookmark);
  assert.deepEqual(decodePlanner(JSON.stringify(next)).savedVideos, [bookmark]);
  assert.equal(old.savedVideos, undefined);
  assert.equal(next.recipes.length, 0);
  assert.deepEqual(generateGroceries(blankWeek()).items, []);
});
test('evita duplicados equivalentes pero permite guardar enlaces de ambas plataformas', () => {
  const data = addSavedVideo(blankPlanner(), bookmark);
  assert.throws(() => addSavedVideo(data, { ...bookmark, id: 'second', source: parseVideoUrl('https://youtu.be/dQw4w9WgXcQ?si=other') }));
  assert.equal(addSavedVideo(data, { ...bookmark, id: 'tiktok', source: parseVideoUrl('https://vm.tiktok.com/ZM123abc/') }).savedVideos.length, 2);
});
test('completar es atómico: valida ingredientes, conserva origen y no modifica snapshots', () => {
  const data = addSavedVideo(blankPlanner(), bookmark);
  assert.throws(() => completeSavedVideo(data, bookmark.id, { ...recipe, ingredients: [] }));
  assert.equal(data.savedVideos.length, 1);
  const completed = completeSavedVideo(data, bookmark.id, { ...recipe, source: bookmark.source });
  assert.equal(completed.savedVideos.length, 0);
  assert.deepEqual(completed.recipes[0].source, bookmark.source);
  assert.throws(() => addSavedVideo(completed, bookmark));
  assert.throws(() => completeSavedVideo(completed, bookmark.id, recipe));
  const week = blankWeek();
  week[0][1] = { recipe: completed.recipes[0], servings: 4 };
  completed.weeks['2026-10-12'] = week;
  assert.equal(generateGroceries(decodePlanner(JSON.stringify(completed)).weeks['2026-10-12']).items[0].quantity, 500);
  const edited = validateRecipe({ ...completed.recipes[0], title: 'Nombre editado' });
  assert.deepEqual(edited.source, bookmark.source);
  assert.equal(week[0][1].recipe.title, 'Sopa');
});
test('almacenamiento corrupto o fuentes inválidas se rechazan', () => {
  const data = addSavedVideo(blankPlanner(), bookmark);
  data.savedVideos[0].source.url = 'https://evil.test';
  assert.throws(() => decodePlanner(JSON.stringify(data)));
  assert.throws(() => decodePlanner(JSON.stringify({ ...blankPlanner(), savedVideos: {} })));
  assert.throws(() => validateRecipe({ ...recipe, source: { url: youtube, platform: 'YouTube', author: 'a'.repeat(121) } }));
});
