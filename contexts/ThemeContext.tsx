import { createContext, useContext, useEffect, useMemo, useRef, useState, type PropsWithChildren } from 'react';
import { lightColors, darkColors, type ColorMode, type ThemeColors } from '../constants/theme';
import { themePreference } from '../services/themePreference';

type Theme = { colors: ThemeColors; mode: ColorMode; ready: boolean; busy: boolean; error: string; toggle: () => Promise<void> };
const ThemeContext = createContext<Theme | null>(null);

export function ThemeProvider({ children }: PropsWithChildren) {
  const [mode, setMode] = useState<ColorMode>('light');
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const lock = useRef(false);
  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.documentElement.style.colorScheme = mode;
    document.documentElement.style.backgroundColor = mode === 'dark' ? darkColors.background : lightColors.background;
  }, [mode]);
  useEffect(() => {
    let active = true;
    void themePreference.load().then(value => { if (active) setMode(value); })
      .catch(() => { if (active) setError('No pudimos recuperar tu preferencia de apariencia.'); })
      .finally(() => { if (active) setReady(true); });
    return () => { active = false; };
  }, []);
  async function toggle() {
    if (!ready || lock.current) return;
    lock.current = true; setBusy(true); setError('');
    const next = mode === 'dark' ? 'light' : 'dark';
    try { await themePreference.save(next); setMode(next); }
    catch { setError('No pudimos guardar la apariencia. Vuelve a intentarlo.'); }
    finally { lock.current = false; setBusy(false); }
  }
  return <ThemeContext.Provider value={{ colors: mode === 'dark' ? darkColors : lightColors, mode, ready, busy, error, toggle }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const theme = useContext(ThemeContext);
  if (!theme) throw new Error('La apariencia requiere ThemeProvider.');
  return theme;
}

// Each component observes the theme without remounting or losing its draft state.
export function createThemedStyles<T>(factory: (colors: ThemeColors) => T) {
  return function useThemedStyles() {
    const { colors } = useTheme();
    const styles = useMemo(() => factory(colors), [colors]);
    return { colors, styles };
  };
}
