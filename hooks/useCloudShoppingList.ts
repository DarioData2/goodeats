import { useCallback, useEffect, useRef, useState } from 'react';
import type { LocalShoppingItem, ShoppingItemInput, ShoppingList } from '../types/shopping';
import * as service from '../services/shoppingService';
import { toLocalItem } from '../services/cloudShoppingLogic';

export function useCloudShoppingList() {
  const [items, setItems] = useState<LocalShoppingItem[]>([]);
  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const busy = useRef(false);
  const mounted = useRef(true);
  const current = useRef<LocalShoppingItem[]>([]);
  const selected = useRef<string | null>(null);
  const load = useCallback(async (requestedId?: string) => {
    if (busy.current) return;
    busy.current = true; setLoading(true); setReady(false); setError(null);
    current.current = []; setItems([]);
    try {
      const available = await service.getShoppingLists();
      if (!mounted.current) return;
      setLists(available);
      const preferred = requestedId ?? selected.current;
      const id = available.find(list => list.id === preferred)?.id ?? available[0]?.id ?? null;
      selected.current = id; setSelectedId(id);
      if (id) {
        const saved = (await service.getShoppingItems(id)).map(toLocalItem);
        if (mounted.current) { current.current = saved; setItems(saved); setReady(true); }
      }
    } catch (issue) {
      if (mounted.current) setError(issue instanceof Error ? issue.message : 'No pudimos cargar Supabase.');
    } finally { busy.current = false; if (mounted.current) setLoading(false); }
  }, []);
  useEffect(() => {
    mounted.current = true; void load();
    return () => { mounted.current = false; };
  }, [load]);

  async function createList(name: string): Promise<boolean> {
    if (busy.current) return false;
    busy.current = true; setSaving(true); setError(null);
    try {
      const created = await service.createShoppingList(name);
      if (!mounted.current) return false;
      setLists(previous => [...previous, created]);
      selected.current = created.id; setSelectedId(created.id);
      current.current = []; setItems([]); setReady(true);
      return true;
    } catch (issue) {
      if (mounted.current) setError(issue instanceof Error ? issue.message : 'No pudimos crear la lista.');
      return false;
    } finally { busy.current = false; if (mounted.current) setSaving(false); }
  }

  async function commit(change: (id: string, previous: LocalShoppingItem[]) => Promise<LocalShoppingItem[]>): Promise<boolean> {
    if (busy.current || !ready || !selected.current) return false;
    busy.current = true; setSaving(true); setError(null);
    try {
      const next = await change(selected.current, current.current);
      if (!mounted.current) return false;
      current.current = next; setItems(next);
      return true;
    } catch (issue) {
      if (mounted.current) setError(`${issue instanceof Error ? issue.message : 'No pudimos guardar.'} Recarga la lista antes de reintentar si se perdió la conexión.`);
      return false;
    } finally { busy.current = false; if (mounted.current) setSaving(false); }
  }
  return {
    items, lists, selectedId, loading, saving, ready, error, reload: () => load(), selectList: load, createList,
    add: (input: ShoppingItemInput) => commit(async (id, previous) => [...previous, toLocalItem(await service.createShoppingItem({
      shopping_list_id: id, name: input.name, quantity: input.quantity ?? null, unit: input.unit ?? null,
    }))]),
    edit: (itemId: string, input: ShoppingItemInput) => commit(async (id, previous) => {
      const updated = toLocalItem(await service.updateShoppingItem(id, itemId, {
        name: input.name, quantity: input.quantity ?? null, unit: input.unit ?? null,
      }));
      return previous.map(item => item.id === itemId ? updated : item);
    }),
    toggle: (itemId: string) => commit(async (id, previous) => {
      const item = previous.find(value => value.id === itemId);
      if (!item) throw new Error('El producto ya no está en la lista.');
      const updated = toLocalItem(await service.updateShoppingItem(id, itemId, { purchased: !item.purchased }));
      return previous.map(value => value.id === itemId ? updated : value);
    }),
    remove: (itemId: string) => commit(async (id, previous) => {
      await service.deleteShoppingItem(id, itemId);
      return previous.filter(item => item.id !== itemId);
    }),
    clearPurchased: () => commit(async (id) => {
      await service.clearPurchasedItems(id);
      return (await service.getShoppingItems(id)).map(toLocalItem);
    }),
  };
}
