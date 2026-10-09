import AsyncStorage from '@react-native-async-storage/async-storage';
import { weekStart } from './menuDates';

export const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'] as const;
export const MEALS = ['Desayuno', 'Almuerzo', 'Cena'] as const;
export type WeeklyMenu = string[][];
export const emptyMenu = (): WeeklyMenu => DAYS.map(() => MEALS.map(() => ''));

export function decodeMenu(raw: string | null): WeeklyMenu {
  if (raw === null) return emptyMenu();
  const data: unknown = JSON.parse(raw);
  if (!Array.isArray(data) || data.length !== DAYS.length || data.some(day =>
    !Array.isArray(day) || day.length !== MEALS.length || day.some(meal => typeof meal !== 'string' || meal.length > 240))) {
    throw new Error('El menú guardado tiene un formato inválido.');
  }
  return data;
}
export const menuStorage = {
  key: (owner: string) => `@goodeats/weekly-menu/v1/${owner}`,
  async load(owner: string, week: string) {
    const key = `${this.key(owner)}/${week}`;
    const raw = await AsyncStorage.getItem(key);
    if (raw !== null) return decodeMenu(raw);
    // Conserva el primer menú sin fechas en la semana actual, una sola vez.
    if (week === weekStart() && await AsyncStorage.getItem(`${this.key(owner)}/migrated`) === null) {
      const legacy = await AsyncStorage.getItem(this.key(owner));
      const menu = decodeMenu(legacy);
      await AsyncStorage.setItem(key, JSON.stringify(menu));
      await AsyncStorage.setItem(`${this.key(owner)}/migrated`, 'true');
      return menu;
    }
    return emptyMenu();
  },
  async save(owner: string, week: string, menu: WeeklyMenu) {
    await AsyncStorage.setItem(`${this.key(owner)}/${week}`, JSON.stringify(menu));
  },
};
