export const lightColors = {
  background: '#F9FAFB', surface: '#FFFFFF', ink: '#111827', muted: '#4B5563',
  primary: '#6D28D9', primaryDark: '#5B21B6', primarySoft: '#F3EEFC',
  accent: '#FF7A18', accentSoft: '#FFF1E7', accentText: '#9A3D00',
  onPrimary: '#FFFFFF', onAccent: '#111827', border: '#E5E7EB',
  input: '#FFFFFF', controlBorder: '#6B7280', danger: '#B42318', errorBackground: '#FEF3F2',
  disabled: '#E5E7EB', onDisabled: '#4B5563', transparent: 'transparent',
  overlay: 'rgba(17,24,39,0.4)',
  onAccentIcon: '#FFFFFF',
  foodVegetable: '#247344', foodVegetableSoft: '#EAF5ED',
  foodFruit: '#AD3B25', foodFruitSoft: '#FFF0E8',
  foodDairy: '#285BA8', foodDairySoft: '#EAF1FC',
  foodEgg: '#876115', foodEggSoft: '#FBF4DF',
  foodMeat: '#A43555', foodMeatSoft: '#FCECF1',
  foodFish: '#087380', foodFishSoft: '#E5F5F7',
  foodGrain: '#80552E', foodGrainSoft: '#F5EEE6',
  foodBean: '#7545A0', foodBeanSoft: '#F2EBF9',
};

export type ThemeColors = typeof lightColors;
export type ColorMode = 'light' | 'dark';
export const darkColors: ThemeColors = {
  background: '#09090B', surface: '#18181B', ink: '#FAFAFA', muted: '#B8BBC5',
  primary: '#C4A4FF', primaryDark: '#D7C2FF', primarySoft: '#2A1E40',
  accent: '#FF7A18', accentSoft: '#352115', accentText: '#FFAD70',
  onPrimary: '#160C24', onAccent: '#111827', border: '#3F3F46',
  input: '#202024', controlBorder: '#85858F', danger: '#FFABA3', errorBackground: '#3B171B',
  disabled: '#303036', onDisabled: '#B8BBC5', transparent: 'transparent',
  overlay: 'rgba(0,0,0,0.7)', onAccentIcon: '#FFFFFF',
  foodVegetable: '#90D8A5', foodVegetableSoft: '#182E21',
  foodFruit: '#FFAD91', foodFruitSoft: '#382219',
  foodDairy: '#A2C5FF', foodDairySoft: '#1A2940',
  foodEgg: '#E5C772', foodEggSoft: '#302916',
  foodMeat: '#FFA9C1', foodMeatSoft: '#361E29',
  foodFish: '#84D7E1', foodFishSoft: '#173036',
  foodGrain: '#DDBC96', foodGrainSoft: '#30271D',
  foodBean: '#CEAFF0', foodBeanSoft: '#2B2138',
};

export const ui = {
  radius: { card: 20, control: 12 },
  spacing: { small: 8, medium: 16, large: 24 },
};
