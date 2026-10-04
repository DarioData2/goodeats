import { useCallback, useEffect, useRef, useState } from 'react';
import { randomUUID } from 'expo-crypto';
import type { LocalShoppingItem as ShoppingItem, ShoppingItemInput, ShoppingStorage } from '../types/shopping';
import { shoppingStorage } from '../services/shoppingStorage';
import { clearPurchased, toggleItem, updateItem } from '../services/shoppingLogic';

export function useShoppingList(storage: ShoppingStorage = shoppingStorage) {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const busy = useRef(false);
  const current = useRef<ShoppingItem[]>([]);
  const mounted = useRef(true);
  const load = useCallback(async () => {
    if (busy.current) return;
    busy.current = true; setLoading(true); setError(null);
    try {
      const saved = await storage.load();
      if (mounted.current) { current.current = saved; setItems(saved); setReady(true); }
    } catch {
      if (mounted.current) {
        setReady(false);
        setError('No pudimos leer tu lista. Tus datos guardados se conservaron. Intenta cargarla de nuevo.');
      }
    } finally { busy.current = false; if (mounted.current) setLoading(false); }
  }, [storage]);
  useEffect(() => {
    mounted.current = true; void load();
    return () => { mounted.current = false; };
  }, [load]);
  async function commit(change: (previous: ShoppingItem[]) => ShoppingItem[]) {
    if (busy.current || !ready) return false;
    busy.current = true; setSaving(true); setError(null);
    try {
      const next = change(current.current);
      await storage.save(next);
      current.current = next;
      if (mounted.current) setItems(next);
      return true;
    } catch {
      if (mounted.current) setError('No pudimos guardar el cambio. La lista no se modificó; vuelve a intentarlo.');
      return false;
    } finally { busy.current = false; if (mounted.current) setSaving(false); }
  }
  return {
    items, loading, saving, ready, error, reload: load,
    add: (input: ShoppingItemInput) => commit(previous => [...previous, {
      ...input, id: randomUUID(), purchased: false, createdAt: new Date().toISOString(),
    }]),
    edit: (id: string, input: ShoppingItemInput) => commit(previous => updateItem(previous, id, input)),
    remove: (id: string) => commit(previous => previous.filter(item => item.id !== id)),
    toggle: (id: string) => commit(previous => toggleItem(previous, id)),
    clearPurchased: () => commit(clearPurchased),
  };
}
