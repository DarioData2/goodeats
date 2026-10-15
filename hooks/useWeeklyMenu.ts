import { useCallback, useEffect, useRef, useState } from 'react';
import { emptyMenu, menuStorage } from '../services/menuStorage';
import { loadMenu, saveMenu } from '../services/mealPlanningService';

export function useWeeklyMenu(owner: string, week: string) {
  const [menu, setMenu] = useState(emptyMenu);
  const [savedMenu, setSavedMenu] = useState(emptyMenu);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(true);
  const busy = useRef(false);
  const load = useCallback(async () => {
    if (busy.current) return;
    busy.current = true; setLoading(true); setError(null);
    try {
      const saved = await loadMenu(owner, week);
      if (mounted.current) { setMenu(saved); setSavedMenu(saved); setReady(true); setDirty(false); }
    } catch {
      if (mounted.current) { setReady(false); setError('No pudimos cargar tu menú. Los datos guardados se conservaron.'); }
    } finally { busy.current = false; if (mounted.current) setLoading(false); }
  }, [owner, week]);
  useEffect(() => {
    mounted.current = true; void load();
    return () => { mounted.current = false; };
  }, [load]);
  function update(day: number, meal: number, value: string) {
    if (!ready || busy.current) return;
    setMenu(previous => previous.map((entries, index) => index === day ? entries.map((entry, slot) => slot === meal ? value : entry) : entries));
    setDirty(true); setError(null);
  }
  async function save() {
    if (!ready || busy.current) return;
    busy.current = true; setSaving(true); setError(null);
    try {
      const next = menu.map(day => day.map(meal => meal.trim()));
      await saveMenu(owner, week, next);
      if (mounted.current) { setMenu(next); setSavedMenu(next); setDirty(false); }
    } catch {
      if (mounted.current) setError('No pudimos guardar el menú. Conservamos lo que escribiste; vuelve a intentarlo.');
    } finally { busy.current = false; if (mounted.current) setSaving(false); }
  }
  async function importLocal() {
    if (!ready || busy.current || dirty || owner === 'local') return;
    busy.current = true; setLoading(true); setError(null);
    try {
      const local = await menuStorage.load('local', week);
      if (mounted.current) { setMenu(local); setDirty(true); }
    } catch { if (mounted.current) setError('No pudimos recuperar el menú local.'); }
    finally { busy.current = false; if (mounted.current) setLoading(false); }
  }
  function cancel() { if (!busy.current) { setMenu(savedMenu); setDirty(false); setError(null); } }
  return { menu, savedMenu, ready, loading, saving, dirty, error, update, save, cancel, importLocal, reload: load };
}
