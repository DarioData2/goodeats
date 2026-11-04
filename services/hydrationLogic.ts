import { dateKey, dayDate } from './menuDates';

export type WaterEntry = { id: string; ml: number; at: string };
export type HydrationData = { version: 1; goalMl: number | null; days: Record<string, WaterEntry[]> };
export const blankHydration = (): HydrationData => ({ version: 1, goalMl: null, days: {} });
export function waterAmount(value: string): number {
  if (!/^\d+$/.test(value.trim())) throw new Error('Escribe una cantidad entera en ml, entre 1 y 10.000.');
  const ml = Number(value);
  if (!Number.isSafeInteger(ml) || ml < 1 || ml > 10000) throw new Error('Escribe una cantidad entera en ml, entre 1 y 10.000.');
  return ml;
}
export const waterTotal = (entries: WaterEntry[]) => entries.reduce((sum, entry) => sum + entry.ml, 0);
export const BOTTLE_CAPACITY_ML = 1000;
export const bottleLevel = (total: number) => Math.min(BOTTLE_CAPACITY_ML, Math.max(0, total));
export function litersToMl(value: string): number {
  const normalized = value.trim().replace(',', '.');
  if (!/^\d+(\.\d{1,3})?$/.test(normalized)) throw new Error('Escribe tu meta en litros, entre 0,001 y 10. Ejemplo: 1,5.');
  const ml = Math.round(Number(normalized) * 1000);
  if (!Number.isSafeInteger(ml) || ml < 1 || ml > 10000) throw new Error('Escribe tu meta en litros, entre 0,001 y 10. Ejemplo: 1,5.');
  return ml;
}
export const formatLiters = (ml: number) => (ml / 1000).toLocaleString('es-CL', { maximumFractionDigits: 3 });
export function waterBottles(total: number, goalMl = BOTTLE_CAPACITY_ML) {
  // Plan enough bottles for the goal and prepare another when the last is full.
  const count = Math.max(Math.ceil(goalMl / BOTTLE_CAPACITY_ML), Math.floor(total / BOTTLE_CAPACITY_ML) + 1);
  const start = Math.max(0, count - 12);
  return {
    completedBefore: start,
    bottles: Array.from({ length: count - start }, (_, offset) => {
      const index = start + offset;
      return { number: index + 1, ml: bottleLevel(total - index * BOTTLE_CAPACITY_ML) };
    }),
  };
}
export function decodeHydration(raw: string | null): HydrationData {
  if (raw === null) return blankHydration();
  const data = JSON.parse(raw) as HydrationData;
  if (!data || data.version !== 1 || !data.days || typeof data.days !== 'object' || Array.isArray(data.days)) throw new Error('Registro de hidratación inválido.');
  if (data.goalMl !== null) {
    if (typeof data.goalMl !== 'number') throw new Error('Meta inválida.');
    waterAmount(String(data.goalMl));
  }
  for (const [date, entries] of Object.entries(data.days)) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || dateKey(dayDate(date, 0)) !== date || !Array.isArray(entries) || entries.length > 1000) throw new Error('Día de hidratación inválido.');
    const ids = new Set<string>();
    for (const entry of entries) {
      if (!entry || typeof entry.id !== 'string' || !entry.id || ids.has(entry.id) || typeof entry.ml !== 'number' || typeof entry.at !== 'string' || !Number.isFinite(Date.parse(entry.at))) throw new Error('Registro de agua inválido.');
      waterAmount(String(entry.ml)); ids.add(entry.id);
    }
  }
  return data;
}
export function addWater(data: HydrationData, date: string, entry: WaterEntry): HydrationData {
  return decodeHydration(JSON.stringify({ ...data, days: { ...data.days, [date]: [...(data.days[date] ?? []), entry] } }));
}
export function undoWater(data: HydrationData, date: string): HydrationData {
  return { ...data, days: { ...data.days, [date]: (data.days[date] ?? []).slice(0, -1) } };
}
