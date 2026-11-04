import AsyncStorage from '@react-native-async-storage/async-storage';
import { decodeHydration, type HydrationData } from './hydrationLogic';

export const hydrationKey = (owner: string) => `@goodeats/hydration/v1/${owner}`;
export const hydrationStorage = {
  async load(owner: string) { return decodeHydration(await AsyncStorage.getItem(hydrationKey(owner))); },
  async update(owner: string, change: (data: HydrationData) => HydrationData) {
    const current = await this.load(owner);
    const next = decodeHydration(JSON.stringify(change(current)));
    await AsyncStorage.setItem(hydrationKey(owner), JSON.stringify(next));
    return next;
  },
};
