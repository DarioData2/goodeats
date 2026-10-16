import { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import type { User } from '@supabase/supabase-js';
import { signIn, signOut, signUp } from '../services/authService';
import { supabaseConfigurationError } from '../lib/supabase';
import { colors, ui } from '../constants/theme';
import { Button } from './Button';
import { Heading } from './Heading';

export function AccountPanel({ user, disabled }: { user: User | null; disabled: boolean }) {
  const [register, setRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
      setShowPassword(false);
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
    {user && <Heading level={2} style={styles.title}>Tu cuenta</Heading>}
    <Text style={styles.note}>{user ? user.email : 'Accede a tus listas manuales, menús anteriores y recetas por fecha guardados en tu cuenta.'}</Text>
    {user && <Button secondary label={busy ? 'Cerrando sesión…' : 'Cerrar sesión'} disabled={disabled || busy} onPress={() => void logout()} />}
    {!user && <View style={styles.form}>
      <Heading level={2} style={styles.title}>{register ? 'Crear cuenta' : 'Tus datos de acceso'}</Heading>
      <Text style={styles.label}>Correo electrónico</Text>
      <TextInput accessibilityLabel="Correo electrónico" placeholder="tu@correo.com" placeholderTextColor={colors.muted}
        value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoCorrect={false}
        autoComplete="email" editable={!busy} style={styles.input} />
      <Text style={styles.label}>Contraseña</Text>
      <View style={styles.passwordField}>
        <TextInput accessibilityLabel="Contraseña" placeholder="Contraseña" placeholderTextColor={colors.muted}
          value={password} onChangeText={setPassword} secureTextEntry={!showPassword} autoCapitalize="none" autoCorrect={false}
          autoComplete={register ? 'new-password' : 'current-password'} editable={!busy} style={styles.passwordInput}
          onSubmitEditing={() => void submit()} />
        <Pressable accessibilityRole="button" accessibilityLabel={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          accessibilityState={{ disabled: busy }} disabled={busy} onPress={() => setShowPassword(value => !value)}
          style={({ pressed }) => [styles.passwordToggle, pressed && { opacity: 0.75 }]}>
          <Text style={styles.passwordToggleText}>{showPassword ? 'Ocultar' : 'Mostrar'}</Text>
        </Pressable>
      </View>
      <Button label={busy ? 'Conectando…' : register ? 'Crear cuenta' : 'Entrar'} disabled={busy || disabled} onPress={() => void submit()} />
      <Button secondary label={register ? 'Ya tengo cuenta' : 'Crear una cuenta nueva'} disabled={busy}
        onPress={() => { setRegister(!register); setShowPassword(false); setError(null); setMessage(null); }} />
    </View>}
    {(error || supabaseConfigurationError) && <Text accessibilityRole="alert" style={styles.error}>{error || supabaseConfigurationError}</Text>}
    {message && <Text accessibilityLiveRegion="polite" style={styles.note}>{message}</Text>}
  </View>;
}
const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: ui.radius.card, padding: 20, gap: 12, marginBottom: 24 },
  title: { fontSize: 17, fontWeight: '700', color: colors.ink }, note: { color: colors.muted, lineHeight: 21 },
  label: { color: colors.ink, fontSize: 15, fontWeight: '600' },
  form: { gap: 12, maxWidth: 440, width: '100%' },
  input: { minHeight: 50, borderWidth: 1, borderColor: colors.controlBorder, borderRadius: ui.radius.control, padding: 14, fontSize: 16, color: colors.ink, backgroundColor: colors.input },
  passwordField: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.controlBorder, borderRadius: ui.radius.control, backgroundColor: colors.input },
  passwordInput: { flex: 1, minWidth: 0, minHeight: 50, padding: 14, fontSize: 16, color: colors.ink },
  passwordToggle: { minHeight: 48, paddingHorizontal: 14, justifyContent: 'center', alignItems: 'center' },
  passwordToggleText: { color: colors.primaryDark, fontSize: 14, fontWeight: '700' },
  error: { color: colors.danger, lineHeight: 22 },
});
