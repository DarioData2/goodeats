import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { blankPlanner, decodePlanner, type PlannerData } from '../services/plannerLogic';

export function usePlanner(owner: string) {
  const [data, setData] = useState(blankPlanner);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const locked = useRef(false);
  const mounted = useRef(true);
  const key = `@goodeats/planner/v1/${owner}`;
  const reload = useCallback(async () => {
    if (locked.current) return;
    locked.current = true; setBusy(true); setError('');
    try {
      const value = decodePlanner(await AsyncStorage.getItem(key));
      if (mounted.current) { setData(value); setReady(true); }
    } catch { if (mounted.current) { setReady(false); setError('No pudimos leer la planificación. Tus datos se conservaron; vuelve a cargar.'); } }
    finally { locked.current = false; if (mounted.current) setBusy(false); }
  }, [key]);
  useEffect(() => { mounted.current = true; void reload(); return () => { mounted.current = false; }; }, [reload]);
  useFocusEffect(useCallback(() => { void reload(); }, [reload]));
  async function save(change: (value: PlannerData) => PlannerData) {
    if (!ready || locked.current) return false;
    locked.current = true; setBusy(true); setError('');
    try {
      const latest = decodePlanner(await AsyncStorage.getItem(key));
      const next = decodePlanner(JSON.stringify(change(latest)));
      await AsyncStorage.setItem(key, JSON.stringify(next));
      if (mounted.current) { setData(next); }
      return true;
    } catch { if (mounted.current) setError('No pudimos guardar. Conservamos tu borrador; vuelve a intentarlo.'); return false; }
    finally { locked.current = false; if (mounted.current) setBusy(false); }
  }
  return { data, ready, busy, error, save, reload };
}
