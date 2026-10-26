export const AVATAR_BUCKET = 'profile-avatars';
export const MAX_AVATAR_BYTES = 512 * 1024;
export type ProfileNames = { firstName: string; lastName: string };
export function validateProfileNames(input: ProfileNames): ProfileNames {
  const firstName = input.firstName.trim();
  const lastName = input.lastName.trim();
  if (!firstName || firstName.length > 80 || /[\u0000-\u001f\u007f]/.test(firstName)) throw new Error('Escribe un nombre de hasta 80 caracteres.');
  if (!lastName || lastName.length > 80 || /[\u0000-\u001f\u007f]/.test(lastName)) throw new Error('Escribe un apellido de hasta 80 caracteres.');
  return { firstName, lastName };
}
export function profileNames(metadata: Record<string, unknown> = {}): ProfileNames {
  return { firstName: typeof metadata.first_name === 'string' ? metadata.first_name.slice(0, 80) : '', lastName: typeof metadata.last_name === 'string' ? metadata.last_name.slice(0, 80) : '' };
}
export function avatarPath(owner: string, metadata: Record<string, unknown> = {}): string | null {
  const path = metadata.avatar_path;
  return typeof path === 'string' && path.startsWith(`${owner}/`) && /^[\w-]+\/[\w-]+\.jpg$/.test(path) ? path : null;
}
export function validateAvatar(bytes: ArrayBuffer) {
  const data = new Uint8Array(bytes);
  if (data.length < 4 || data.length > MAX_AVATAR_BYTES || data[0] !== 255 || data[1] !== 216 || data[2] !== 255) throw new Error('La foto debe ser JPEG y ocupar como máximo 512 KB. Vuelve a seleccionarla.');
}
