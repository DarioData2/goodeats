import { useCallback, useEffect, useRef, useState } from 'react';
import { emptyRecipe, parseRecipe, type DailyRecipe } from '../services/recipeLogic';
import { loadRecipe, saveRecipe } from '../services/mealPlanningService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { decodeRecipe } from '../services/recipeLogic';

export function useDailyRecipe(owner: string, date: string) {
  const [recipe, setRecipe] = useState(emptyRecipe);
  const [saved, setSaved] = useState(emptyRecipe);
  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(true);
  const busy = useRef(false);
  const load = useCallback(async () => {
    if (busy.current) return;
    busy.current = true; setLoading(true); setError(null);
    try {
      const result = await loadRecipe(owner, date);
      if (mounted.current) { setRecipe(result); setSaved(result); setReady(true); setDirty(false); }
    } catch {
      if (mounted.current) { setReady(false); setError('No pudimos cargar la receta. Los datos guardados se conservaron.'); }
    } finally { busy.current = false; if (mounted.current) setLoading(false); }
  }, [owner, date]);
  useEffect(() => { mounted.current = true; void load(); return () => { mounted.current = false; }; }, [load]);
  function update(field: keyof DailyRecipe, value: string) {
    if (!ready || busy.current) return;
    setRecipe(previous => ({ ...previous, [field]: value })); setDirty(true); setError(null);
  }
  async function save() {
    if (!ready || busy.current) return;
    let next: DailyRecipe;
    try { next = parseRecipe(recipe); }
    catch (issue) { setError((issue as Error).message); return; }
    busy.current = true; setSaving(true); setError(null);
    try {
      await saveRecipe(owner, date, next);
      if (mounted.current) { setRecipe(next); setSaved(next); setDirty(false); }
    } catch {
      if (mounted.current) setError('No pudimos guardar. Conservamos lo que escribiste; vuelve a intentarlo.');
    } finally { busy.current = false; if (mounted.current) setSaving(false); }
  }
  function cancel() { if (!busy.current) { setRecipe(saved); setDirty(false); setError(null); } }
  async function importLocal() {
    if (!ready || busy.current || dirty || owner === 'local') return;
    busy.current = true; setLoading(true); setError(null);
    try {
      const local = decodeRecipe(await AsyncStorage.getItem(`@goodeats/daily-recipe/v1/local/${date}`));
      if (mounted.current) { setRecipe(local); setDirty(true); }
    } catch { if (mounted.current) setError('No pudimos recuperar la receta local.'); }
    finally { busy.current = false; if (mounted.current) setLoading(false); }
  }
  return { recipe, saved, ready, loading, saving, dirty, error, update, save, cancel, importLocal, reload: load };
}
