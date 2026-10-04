import type { LocalShoppingItem, ShoppingItem } from '../types/shopping';

export function toLocalItem(item: ShoppingItem): LocalShoppingItem {
  return {
    id: item.id, name: item.name, purchased: item.purchased, createdAt: item.created_at,
    quantity: item.quantity ?? undefined, unit: item.unit ?? undefined,
  };
}
