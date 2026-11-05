import { requireSupabase } from '../lib/supabase';
import { decodeHydration, type HydrationData } from './hydrationLogic';
import { hydrationStorage } from './hydrationStorage';

async function account(owner: string) {
  const client = requireSupabase();
  const { data, error } = await client.auth.getUser();
  if (error || data.user?.id !== owner) throw new Error('Tu sesión cambió. Inicia sesión con la cuenta correspondiente.');
  return client;
}
function readError() { return new Error('No pudimos cargar la hidratación desde tu cuenta. Comprueba la conexión y vuelve a cargar. Tus registros locales se conservaron.'); }
async function cloudSnapshot(owner: string) {
  const client = await account(owner);
  const { data, error } = await client.from('hydration_profiles').select('payload,revision').eq('user_id', owner).maybeSingle();
  if (error) throw readError();
  if (data) return { data: decodeHydration(JSON.stringify(data.payload)), revision: data.revision };
  // Import only this account's local history, and never overwrite a competing insert.
  const local = await hydrationStorage.load(owner);
  await account(owner);
  const { error: insertError } = await client.from('hydration_profiles').upsert({ user_id: owner, payload: local }, { onConflict: 'user_id', ignoreDuplicates: true });
  if (insertError) throw new Error('No pudimos activar el guardado en tu cuenta. Tu historial local sigue intacto. Vuelve a cargar para reintentar.');
  const latest = await account(owner);
  const { data: confirmed, error: reloadError } = await latest.from('hydration_profiles').select('payload,revision').eq('user_id', owner).maybeSingle();
  if (reloadError || !confirmed) throw readError();
  return { data: decodeHydration(JSON.stringify(confirmed.payload)), revision: confirmed.revision };
}
export const hydrationService = {
  async load(owner: string): Promise<HydrationData> {
    if (owner === 'local') return hydrationStorage.load(owner);
    return (await cloudSnapshot(owner)).data;
  },
  async update(owner: string, change: (data: HydrationData) => HydrationData): Promise<HydrationData> {
    if (owner === 'local') return hydrationStorage.update(owner, change);
    for (let attempt = 0; attempt < 3; attempt++) {
      const snapshot = await cloudSnapshot(owner);
      const next = decodeHydration(JSON.stringify(change(snapshot.data)));
      const client = await account(owner);
      const { data, error } = await client.from('hydration_profiles').update({ payload: next }).eq('user_id', owner).eq('revision', snapshot.revision).select('payload,revision').maybeSingle();
      if (error) throw new Error('No pudimos confirmar el guardado en tu cuenta. Actualiza desde tu cuenta antes de volver a registrar esta cantidad.');
      if (data) return decodeHydration(JSON.stringify(data.payload));
      // A second device saved first. Reapply this operation to the latest revision.
    }
    throw new Error('Otro dispositivo está actualizando tu hidratación. Actualiza desde tu cuenta y vuelve a intentarlo.');
  },
};
