import { requireSupabase } from '../lib/supabase';
import { validateProfileNames, type ProfileNames } from './profileLogic';

export async function signIn(email: string, password: string): Promise<void> {
  const { error } = await requireSupabase().auth.signInWithPassword({ email: email.trim(), password });
  if (error) throw new Error(error.code === 'email_not_confirmed'
    ? 'Confirma tu correo antes de iniciar sesión.'
    : error.code === 'invalid_credentials' ? 'Correo o contraseña incorrectos.' : error.message);
}

export async function signUp(email: string, password: string, names?: ProfileNames): Promise<boolean> {
  const valid = names ? validateProfileNames(names) : undefined;
  const { data, error } = await requireSupabase().auth.signUp({ email: email.trim(), password, ...(valid ? { options: { data: { first_name: valid.firstName, last_name: valid.lastName } } } : {}) });
  if (error) throw new Error(error.message);
  return !!data.session;
}

export async function signOut(): Promise<void> {
  const { error } = await requireSupabase().auth.signOut({ scope: 'local' });
  if (error) throw new Error(error.message);
}

export async function verifyRegistrationEmail(email: string, token: string): Promise<void> {
  const code = token.trim();
  if (!/^\d{6,10}$/.test(code)) throw new Error('Escribe el código numérico que recibiste por correo.');
  const { data, error } = await requireSupabase().auth.verifyOtp({ email: email.trim(), token: code, type: 'email' });
  if (error) throw new Error(error.code === 'over_request_rate_limit' ? 'Demasiados intentos. Espera unos minutos antes de volver a probar.' : 'El código no es válido o venció. Revisa el correo o solicita otro.');
  if (!data.session) throw new Error('No se pudo iniciar la sesión. Intenta entrar con tu correo y contraseña.');
}

export async function resendRegistrationEmail(email: string): Promise<void> {
  const { error } = await requireSupabase().auth.resend({ type: 'signup', email: email.trim() });
  if (error) throw new Error(error.code === 'over_email_send_rate_limit' || error.code === 'over_request_rate_limit'
    ? 'Espera unos minutos antes de solicitar otro código.' : 'No pudimos enviar el código. Intenta de nuevo más tarde.');
}

export function readSignupRedirect(hash: string) {
  const params = new URLSearchParams(hash.replace(/^#/, ''));
  if (params.get('type') === 'signup' && params.has('access_token')) {
    return { accessToken: params.get('access_token') ?? '' };
  }
  if (params.get('error_code') === 'otp_expired') return { accessToken: '' };
  return null;
}

export async function checkSignupRedirect(accessToken: string): Promise<boolean> {
  if (!accessToken) return false;
  const { data, error } = await requireSupabase().auth.getUser(accessToken);
  return !error && Boolean(data.user?.email_confirmed_at);
}
