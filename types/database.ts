import type { ShoppingItem, ShoppingList } from './shopping';

// Contract for the planned schema. Regenerate from Supabase when it is deployed.
export type Database = {
  public: {
    Tables: {
      weekly_menus: {
        Row: { user_id: string; week_start: string; meals: string[][] };
        Insert: { user_id: string; week_start: string; meals: string[][] };
        Update: { meals?: string[][] };
        Relationships: [];
      };
      daily_recipes: {
        Row: { user_id: string; recipe_date: string; title: string; ingredients: string; steps: string };
        Insert: { user_id: string; recipe_date: string; title: string; ingredients: string; steps: string };
        Update: { title?: string; ingredients?: string; steps?: string };
        Relationships: [];
      };
      shopping_lists: {
        Row: ShoppingList;
        Insert: Pick<ShoppingList, 'user_id' | 'name'> & Partial<Pick<ShoppingList, 'id' | 'created_at'>>;
        Update: Partial<Pick<ShoppingList, 'name'>>;
        Relationships: [];
      };
      shopping_items: {
        Row: ShoppingItem;
        Insert: Pick<ShoppingItem, 'shopping_list_id' | 'name'> & Partial<Omit<ShoppingItem, 'shopping_list_id' | 'name'>>;
        Update: Partial<Pick<ShoppingItem, 'name' | 'quantity' | 'unit' | 'purchased' | 'updated_at'>>;
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};
