const { test } = require('node:test');
const assert = require('node:assert/strict');
let stored = null;
let fail = false;
const storagePath = require.resolve('@react-native-async-storage/async-storage');
require.cache[storagePath] = { id: storagePath, filename: storagePath, loaded: true, exports: { __esModule: true, default: {
  getItem: async () => { if (fail) throw new Error('storage unavailable'); return stored; },
  setItem: async (key, value) => { if (fail) throw new Error('storage unavailable'); stored = value; },
} } };
const { themePreference, decodeColorMode } = require('../.test-build/services/themePreference.js');
const { lightColors, darkColors } = require('../.test-build/constants/theme.js');

function luminance(hex) {
  const rgb = hex.match(/[0-9a-f]{2}/gi).map(part => parseInt(part, 16) / 255).map(v => v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
  return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
}
function contrast(a, b) { const l = [luminance(a), luminance(b)].sort((x,y) => y-x); return (l[0] + 0.05) / (l[1] + 0.05); }

test('appearance defaults to light and restores explicit dark/light preferences', async () => {
  fail = false; stored = null;
  assert.equal(await themePreference.load(), 'light');
  await themePreference.save('dark');
  assert.equal(await themePreference.load(), 'dark');
  await themePreference.save('light');
  assert.equal(await themePreference.load(), 'light');
  assert.equal(decodeColorMode('invalid'), 'light');
});

test('storage failure is reported and does not replace the saved preference', async () => {
  stored = 'dark'; fail = true;
  await assert.rejects(themePreference.load());
  await assert.rejects(themePreference.save('light'));
  assert.equal(stored, 'dark'); fail = false;
});

test('both palettes provide AA contrast for text, fields, primary actions and alerts', () => {
  assert.deepEqual(Object.keys(darkColors).sort(), Object.keys(lightColors).sort());
  for (const colors of [lightColors, darkColors]) {
    for (const [text, background] of [
      ['ink','background'], ['ink','surface'], ['ink','input'], ['muted','surface'],
      ['onPrimary','primary'], ['onPrimary','primaryDark'], ['primary','primarySoft'],
      ['primaryDark','primarySoft'], ['accentText','accentSoft'], ['danger','errorBackground'], ['onDisabled','disabled'],
    ]) assert.ok(contrast(colors[text], colors[background]) >= 4.5, `${text}/${background} contrast: ${contrast(colors[text], colors[background])}`);
    assert.ok(contrast(colors.controlBorder, colors.input) >= 3);
  }
});
