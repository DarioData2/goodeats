const test = require('node:test');
const assert = require('node:assert/strict');
const { weekStart, shiftWeek, dayDate } = require('../.test-build/services/menuDates.js');

test('la semana empieza el lunes incluso para un domingo', () => {
  assert.equal(weekStart(new Date(2026, 9, 11, 12)), '2026-10-05');
  assert.equal(weekStart(new Date(2026, 9, 5, 12)), '2026-10-05');
});
test('las semanas conservan las fechas al cruzar meses y años', () => {
  assert.equal(shiftWeek('2026-12-28', 1), '2027-01-04');
  assert.equal(shiftWeek('2027-01-04', -1), '2026-12-28');
  const sunday = dayDate('2026-12-28', 6);
  assert.equal(sunday.getFullYear(), 2027);
  assert.equal(sunday.getMonth(), 0);
  assert.equal(sunday.getDate(), 3);
});
