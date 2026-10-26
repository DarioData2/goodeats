import { requireSupabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';
import { AVATAR_BUCKET, avatarPath, validateAvatar, validateProfileNames, type ProfileNames } from './profileLogic';
export type AvatarChange = { bytes: ArrayBuffer; filename: string } | null | undefined;

export async function readProfile(owner: string): Promise<User> {
  const { data, error } = await requireSupabase().auth.getUser();
  if (error || !data.user || data.user.id !== owner) throw new Error('No pudimos cargar tu perfil. Revisa la conexión o vuelve a iniciar sesión.');
  return data.user;
}

export async function saveProfile(owner: string, names: ProfileNames, avatar: AvatarChange) {
  const valid = validateProfileNames(names);
  const client = requireSupabase();
  async function currentUser() {
    const { data, error } = await client.auth.getUser();
    if (error || !data.user || data.user.id !== owner) throw new Error('Tu sesión cambió. Vuelve a iniciar sesión antes de guardar.');
    return data.user;
  }
  const user = await currentUser();
  const previous = avatarPath(owner, user.user_metadata);
  let uploaded: string | null = null;
  let next = previous;
  const bucket = client.storage.from(AVATAR_BUCKET);
  if (avatar) {
    validateAvatar(avatar.bytes);
    if (!/^[a-zA-Z0-9-]+\.jpg$/.test(avatar.filename)) throw new Error('Nombre de foto inválido.');
    next = `${owner}/${avatar.filename}`;
    const { error } = await bucket.upload(next, avatar.bytes, { contentType: 'image/jpeg', upsert: false, cacheControl: '3600' });
    if (error) throw new Error('No pudimos subir tu foto. Comprueba la conexión y la configuración privada de fotos en Supabase. Tu perfil no se modificó.');
    uploaded = next;
  } else if (avatar === null) next = null;
  let savedUser: User;
  try {
    await currentUser();
    const { data, error } = await client.auth.updateUser({ data: { first_name: valid.firstName, last_name: valid.lastName, avatar_path: next } });
    if (error) throw new Error('No pudimos guardar tu perfil. Conservamos los cambios para que vuelvas a intentarlo.');
    savedUser = data.user;
  } catch (error) {
    if (uploaded) await bucket.remove([uploaded]).catch(() => {});
    throw error;
  }
  // Unreferenced photos can be cleaned without turning a confirmed profile save into a failure.
  if (previous && next !== previous) await bucket.remove([previous]).catch(() => {});
  return savedUser;
}

export async function getAvatarUrl(owner: string, path: string): Promise<string> {
  if (avatarPath(owner, { avatar_path: path }) !== path) throw new Error('Foto inválida.');
  const client = requireSupabase();
  const { data: auth, error: sessionError } = await client.auth.getUser();
  if (sessionError || auth.user?.id !== owner) throw new Error('Sesión inválida.');
  const { data, error } = await client.storage.from(AVATAR_BUCKET).createSignedUrl(path, 3600);
  if (error) throw new Error('No pudimos cargar tu foto.');
  return data.signedUrl;
}
