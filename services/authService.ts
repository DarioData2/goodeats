import { requireSupabase } from '../lib/supabase';

export async function signIn(email: string, password: string): Promise<void> {
  const { error } = await requireSupabase().auth.signInWithPassword({ email: email.trim(), password });
  if (error) throw new Error(error.code === 'email_not_confirmed'
    ? 'Confirma tu correo antes de iniciar sesión.'
    : error.code === 'invalid_credentials' ? 'Correo o contraseña incorrectos.' : error.message);
}

export async function signUp(email: string, password: string): Promise<boolean> {
  const { data, error } = await requireSupabase().auth.signUp({ email: email.trim(), password });
  if (error) throw new Error(error.message);
  return !!data.session;
}

export async function signOut(): Promise<void> {
  const { error } = await requireSupabase().auth.signOut({ scope: 'local' });
  if (error) throw new Error(error.message);
}
