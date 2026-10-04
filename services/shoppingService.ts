import type { PostgrestError } from '@supabase/supabase-js';
import { requireSupabase } from '../lib/supabase';
import type {
  CreateShoppingItemInput, ShoppingItem, ShoppingList, UpdateShoppingItemInput,
} from '../types/shopping';

export class ShoppingServiceError extends Error {
  constructor(message: string, public readonly code?: string) {
    super(message);
    this.name = 'ShoppingServiceError';
  }
}

function checkError(error: PostgrestError | null, operation: string): void {
  if (error) throw new ShoppingServiceError(`${operation}: ${error.message}`, error.code);
}

async function authenticatedClient() {
  const client = requireSupabase();
  const { data: { user }, error } = await client.auth.getUser();
  if (error || !user) {
    throw new ShoppingServiceError('Inicia sesión para utilizar listas en Supabase.', 'AUTH_REQUIRED');
  }
  return { client, user };
}

function cleanName(name: string): string {
  if (!name.trim()) throw new ShoppingServiceError('El nombre es obligatorio.', 'INVALID_INPUT');
  return name.trim();
}

function checkQuantity(quantity: number | null | undefined): void {
  if (quantity != null && (!Number.isFinite(quantity) || quantity <= 0)) {
    throw new ShoppingServiceError('La cantidad debe ser mayor que cero.', 'INVALID_INPUT');
  }
}

// Client guards help callers; ownership must also be enforced by database RLS.
export async function getShoppingLists(): Promise<ShoppingList[]> {
  const { client, user } = await authenticatedClient();
  const { data, error } = await client.from('shopping_lists').select('*')
    .eq('user_id', user.id).order('created_at').order('id');
  checkError(error, 'No pudimos cargar las listas');
  return data ?? [];
}

export async function createShoppingList(name: string): Promise<ShoppingList> {
  const validName = cleanName(name);
  const { client, user } = await authenticatedClient();
  const { data, error } = await client.from('shopping_lists')
    .insert({ name: validName, user_id: user.id }).select('*').single();
  checkError(error, 'No pudimos crear la lista');
  if (!data) throw new ShoppingServiceError('Supabase no devolvió la lista creada.');
  return data;
}

async function ownedList(shoppingListId: string) {
  const { client, user } = await authenticatedClient();
  const { error } = await client.from('shopping_lists').select('id')
    .eq('id', shoppingListId).eq('user_id', user.id).single();
  checkError(error, 'La lista no existe o no tienes acceso');
  return client;
}

export async function getShoppingItems(shoppingListId: string): Promise<ShoppingItem[]> {
  const client = await ownedList(shoppingListId);
  const { data, error } = await client.from('shopping_items').select('*')
    .eq('shopping_list_id', shoppingListId).order('created_at').order('id');
  checkError(error, 'No pudimos cargar los productos');
  return data ?? [];
}

export async function createShoppingItem(input: CreateShoppingItemInput): Promise<ShoppingItem> {
  const name = cleanName(input.name);
  checkQuantity(input.quantity);
  const client = await ownedList(input.shopping_list_id);
  const { data, error } = await client.from('shopping_items').insert({
    shopping_list_id: input.shopping_list_id, name,
    quantity: input.quantity, unit: input.unit?.trim() || null, purchased: false,
  }).select('*').single();
  checkError(error, 'No pudimos crear el producto');
  if (!data) throw new ShoppingServiceError('Supabase no devolvió el producto creado.');
  return data;
}

export async function updateShoppingItem(
  shoppingListId: string, itemId: string, changes: UpdateShoppingItemInput,
): Promise<ShoppingItem> {
  checkQuantity(changes.quantity);
  // Explicit fields prevent accidental changes to identity or ownership.
  const update = {
    ...(changes.name !== undefined ? { name: cleanName(changes.name) } : {}),
    ...(changes.quantity !== undefined ? { quantity: changes.quantity } : {}),
    ...(changes.unit !== undefined ? { unit: changes.unit?.trim() || null } : {}),
    ...(changes.purchased !== undefined ? { purchased: changes.purchased } : {}),
    updated_at: new Date().toISOString(),
  };
  const client = await ownedList(shoppingListId);
  const { data, error } = await client.from('shopping_items').update(update)
    .eq('shopping_list_id', shoppingListId).eq('id', itemId).select('*').single();
  checkError(error, 'No pudimos actualizar el producto');
  if (!data) throw new ShoppingServiceError('Supabase no devolvió el producto actualizado.');
  return data;
}

export async function deleteShoppingItem(shoppingListId: string, itemId: string): Promise<void> {
  const client = await ownedList(shoppingListId);
  const { error, count } = await client.from('shopping_items').delete({ count: 'exact' })
    .eq('shopping_list_id', shoppingListId).eq('id', itemId);
  checkError(error, 'No pudimos eliminar el producto');
  if (count !== 1) throw new ShoppingServiceError('El producto no existe o no tienes permiso para eliminarlo.');
}

export async function clearPurchasedItems(shoppingListId: string): Promise<number> {
  const client = await ownedList(shoppingListId);
  const { error, count } = await client.from('shopping_items').delete({ count: 'exact' })
    .eq('shopping_list_id', shoppingListId).eq('purchased', true);
  checkError(error, 'No pudimos limpiar los productos comprados');
  return count ?? 0;
}
