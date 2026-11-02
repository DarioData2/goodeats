import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ColorMode } from '../constants/theme';

export const THEME_KEY = '@goodeats/appearance/v1';
export const decodeColorMode = (raw: string | null): ColorMode => raw === 'dark' ? 'dark' : 'light';
export const themePreference = {
  async load(): Promise<ColorMode> { return decodeColorMode(await AsyncStorage.getItem(THEME_KEY)); },
  async save(mode: ColorMode): Promise<void> { await AsyncStorage.setItem(THEME_KEY, mode); },
};
