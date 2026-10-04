import { useRef, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import type { User } from '@supabase/supabase-js';
import { signIn, signOut, signUp } from '../services/authService';
import { supabaseConfigurationError } from '../lib/supabase';
import { colors } from '../constants/theme';
import { Button } from './Button';

export function AccountPanel({ user, disabled }: { user: User | null; disabled: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const [register, setRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const lock = useRef(false);
  async function submit() {
    if (lock.current || disabled) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) || !password) {
      setError('Escribe un correo válido y tu contraseña.'); return;
    }
    if (register && password.length < 8) { setError('Usa una contraseña de al menos 8 caracteres.'); return; }
    lock.current = true; setBusy(true); setError(null); setMessage(null);
    try {
      if (register) {
        const signedIn = await signUp(email, password);
        if (!signedIn) {
          setMessage('Revisa tu correo para confirmar la cuenta y luego inicia sesión aquí. Si ya tenías cuenta, inicia sesión.');
          setRegister(false);
        }
      } else await signIn(email, password);
      setPassword('');
    } catch (issue) { setError(issue instanceof Error ? issue.message : 'No pudimos conectar. Intenta de nuevo.'); }
    finally { lock.current = false; setBusy(false); }
  }
  async function logout() {
    if (lock.current || disabled) return;
    lock.current = true; setBusy(true); setError(null);
    try { await signOut(); }
    catch (issue) { setError(issue instanceof Error ? issue.message : 'No pudimos cerrar sesión.'); }
    finally { lock.current = false; setBusy(false); }
  }
  return <View style={styles.card}>
    <Text style={styles.title}>{user ? 'Tu cuenta' : 'Tu lista, en todos tus dispositivos'}</Text>
    <Text style={styles.note}>{user ? user.email : 'Inicia sesión para guardar en Supabase. Sin sesión puedes seguir usando tu lista local.'}</Text>
    {user ? <Button secondary label={busy ? 'Cerrando sesión…' : 'Cerrar sesión'} disabled={disabled || busy} onPress={() => void logout()} /> :
      <Button secondary label={expanded ? 'Continuar con lista local' : 'Iniciar sesión o crear cuenta'} disabled={disabled || busy || !!supabaseConfigurationError}
        onPress={() => { setExpanded(!expanded); setError(null); }} />}
    {!user && expanded && <View style={styles.form}>
      <Text style={styles.title}>{register ? 'Crear cuenta' : 'Iniciar sesión'}</Text>
      <TextInput accessibilityLabel="Correo electrónico" placeholder="tu@correo.com" placeholderTextColor={colors.muted}
        value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoCorrect={false}
        autoComplete="email" editable={!busy} style={styles.input} />
      <TextInput accessibilityLabel="Contraseña" placeholder="Contraseña" placeholderTextColor={colors.muted}
        value={password} onChangeText={setPassword} secureTextEntry autoCapitalize="none" autoCorrect={false}
        autoComplete={register ? 'new-password' : 'current-password'} editable={!busy} style={styles.input}
        onSubmitEditing={() => void submit()} />
      <Button label={busy ? 'Conectando…' : register ? 'Crear cuenta' : 'Entrar'} disabled={busy || disabled} onPress={() => void submit()} />
      <Button secondary label={register ? 'Ya tengo cuenta' : 'Crear una cuenta nueva'} disabled={busy}
        onPress={() => { setRegister(!register); setError(null); setMessage(null); }} />
    </View>}
    {(error || supabaseConfigurationError) && <Text accessibilityRole="alert" style={styles.error}>{error || supabaseConfigurationError}</Text>}
    {message && <Text accessibilityLiveRegion="polite" style={styles.note}>{message}</Text>}
  </View>;
}
const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: 18, padding: 20, gap: 12, marginBottom: 24 },
  title: { fontSize: 17, fontWeight: '700', color: colors.ink }, note: { color: colors.muted, lineHeight: 21 },
  form: { gap: 12, maxWidth: 440, width: '100%' },
  input: { minHeight: 50, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 14, fontSize: 16, color: colors.ink, backgroundColor: colors.input },
  error: { color: colors.danger, lineHeight: 22 },
});
