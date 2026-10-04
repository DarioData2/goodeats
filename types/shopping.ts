export type ShoppingItem = {
  id: string;
  name: string;
  quantity?: number;
  unit?: string;
  purchased: boolean;
  createdAt: string;
};
export type ShoppingItemInput = Pick<ShoppingItem, 'name' | 'quantity' | 'unit'>;
export interface ShoppingStorage {
  load(): Promise<ShoppingItem[]>;
  save(items: ShoppingItem[]): Promise<void>;
}
