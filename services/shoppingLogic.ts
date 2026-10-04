import type { LocalShoppingItem as ShoppingItem, ShoppingItemInput } from '../types/shopping';

export function parseItemInput(name: string, quantity: string, unit: string): ShoppingItemInput {
  const cleanName = name.trim();
  if (!cleanName) throw new Error('Escribe el nombre del producto.');
  const cleanQuantity = quantity.trim().replace(',', '.');
  if (!cleanQuantity) return { name: cleanName, quantity: undefined, unit };
  const value = Number(cleanQuantity);
  if (!/^\d+(\.\d+)?$/.test(cleanQuantity) || !Number.isFinite(value) || value <= 0) {
    throw new Error('La cantidad debe ser un número mayor que cero.');
  }
  return { name: cleanName, quantity: value, unit };
}
export function updateItem(items: ShoppingItem[], id: string, input: ShoppingItemInput): ShoppingItem[] {
  return items.map(item => item.id === id ? { ...item, ...input } : item);
}
export function toggleItem(items: ShoppingItem[], id: string): ShoppingItem[] {
  return items.map(item => item.id === id ? { ...item, purchased: !item.purchased } : item);
}
export function clearPurchased(items: ShoppingItem[]): ShoppingItem[] {
  return items.filter(item => !item.purchased);
}
export function decodeItems(raw: string | null): ShoppingItem[] {
  if (raw === null) return [];
  const data: unknown = JSON.parse(raw);
  if (!Array.isArray(data)) throw new Error('Formato de lista inválido.');
  const ids = new Set<string>();
  for (const item of data) {
    if (!item || typeof item !== 'object' || typeof item.id !== 'string' || !item.id ||
      ids.has(item.id) || typeof item.name !== 'string' || !item.name.trim() ||
      typeof item.purchased !== 'boolean' || typeof item.createdAt !== 'string' ||
      !Number.isFinite(Date.parse(item.createdAt)) ||
      (item.quantity !== undefined && (typeof item.quantity !== 'number' || !Number.isFinite(item.quantity) || item.quantity <= 0)) ||
      (item.unit !== undefined && typeof item.unit !== 'string')) {
      throw new Error('Hay datos inválidos en la lista guardada.');
    }
    ids.add(item.id);
  }
  return data;
}
