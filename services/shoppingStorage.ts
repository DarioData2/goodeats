import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ShoppingStorage } from '../types/shopping';
import { decodeItems } from './shoppingLogic';
const STORAGE_KEY = '@goodeats/shopping-items/v1';
export const shoppingStorage: ShoppingStorage = {
  async load() { return decodeItems(await AsyncStorage.getItem(STORAGE_KEY)); },
  async save(items) { await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items)); },
};
