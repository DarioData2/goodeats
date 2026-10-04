export type LocalShoppingItem = {
  id: string;
  name: string;
  quantity?: number;
  unit?: string;
  purchased: boolean;
  createdAt: string;
};
export type ShoppingItemInput = Pick<LocalShoppingItem, 'name' | 'quantity' | 'unit'>;
export interface ShoppingStorage {
  load(): Promise<LocalShoppingItem[]>;
  save(items: LocalShoppingItem[]): Promise<void>;
}

export type ShoppingList = {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
};

export type ShoppingItem = {
  id: string;
  shopping_list_id: string;
  name: string;
  quantity: number | null;
  unit: string | null;
  purchased: boolean;
  created_at: string;
  updated_at: string | null;
};

export type CreateShoppingItemInput = Pick<ShoppingItem,
  'shopping_list_id' | 'name' | 'quantity' | 'unit'>;
export type UpdateShoppingItemInput = Partial<Pick<ShoppingItem,
  'name' | 'quantity' | 'unit' | 'purchased'>>;
