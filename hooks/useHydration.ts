import { useCallback, useEffect, useRef, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { blankHydration, type HydrationData } from '../services/hydrationLogic';
import { hydrationService } from '../services/hydrationService';

export function useHydration(owner: string) {
  const [data, setData] = useState(blankHydration);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const mounted = useRef(true);
  const lock = useRef(false);
  const reload = useCallback(async () => {
    if (lock.current) return;
    lock.current = true; setBusy(true); setError('');
    try { const next = await hydrationService.load(owner); if (mounted.current) { setData(next); setReady(true); } }
    catch (issue) { if (mounted.current) { setReady(false); setError(issue instanceof Error ? issue.message : 'No pudimos leer tus registros. Los datos guardados se conservaron.'); } }
    finally { lock.current = false; if (mounted.current) setBusy(false); }
  }, [owner]);
  useEffect(() => { mounted.current = true; void reload(); return () => { mounted.current = false; }; }, [reload]);
  useFocusEffect(useCallback(() => { void reload(); }, [reload]));
  async function save(change: (data: HydrationData) => HydrationData) {
    if (!ready || lock.current) return false;
    lock.current = true; setBusy(true); setError('');
    try { const next = await hydrationService.update(owner, change); if (mounted.current) setData(next); return true; }
    catch (issue) { if (mounted.current) setError(issue instanceof Error ? issue.message : 'No pudimos guardar. Conservamos tu entrada para que vuelvas a intentarlo.'); return false; }
    finally { lock.current = false; if (mounted.current) setBusy(false); }
  }
  return { data, ready, busy, error, save, reload };
}
