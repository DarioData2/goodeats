export const lightColors = {
  background: '#F9FAFB', surface: '#FFFFFF', ink: '#111827', muted: '#4B5563',
  primary: '#6D28D9', primaryDark: '#5B21B6', primarySoft: '#F3EEFC',
  accent: '#FF7A18', accentSoft: '#FFF1E7', accentText: '#9A3D00',
  onPrimary: '#FFFFFF', onAccent: '#111827', border: '#E5E7EB',
  input: '#FFFFFF', controlBorder: '#6B7280', danger: '#B42318', errorBackground: '#FEF3F2',
  disabled: '#E5E7EB', onDisabled: '#4B5563', transparent: 'transparent',
  overlay: 'rgba(17,24,39,0.4)',
  onAccentIcon: '#FFFFFF',
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
};

export const ui = {
  radius: { card: 20, control: 12 },
  spacing: { small: 8, medium: 16, large: 24 },
};
