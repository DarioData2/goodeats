import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { createThemedStyles } from '../contexts/ThemeContext';
import { resendRegistrationEmail, verifyRegistrationEmail } from '../services/authService';
import { Button } from './Button';
import { Heading } from './Heading';
import { RecipeField } from './RecipeField';

export function EmailVerificationPanel({ email, sent, disabled, onBack, onVerified }: { email: string; sent: boolean; disabled: boolean; onBack: () => void; onVerified: () => void }) {
  const { styles } = useStyles();
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [retryAt, setRetryAt] = useState(() => sent ? Date.now() + 60000 : 0);
  const [now, setNow] = useState(Date.now);
  const lock = useRef(false);
  useEffect(() => { const timer = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(timer); }, []);
  const remaining = Math.max(0, Math.ceil((retryAt - now) / 1000));
  async function run(resend: boolean) {
    if (lock.current || disabled || (resend && Date.now() < retryAt)) return;
    lock.current = true; setBusy(true); setError(null); setMessage('');
    try {
      if (resend) {
        setRetryAt(Date.now() + 60000);
        await resendRegistrationEmail(email);
        setCode(''); setMessage('Si tu cuenta está pendiente de confirmación, recibirás un código. Revisa también spam.');
      } else {
        await verifyRegistrationEmail(email, code);
        onVerified();
      }
    } catch (issue) { setError(issue instanceof Error ? issue.message : 'No pudimos completar la verificación.'); }
    finally { lock.current = false; setBusy(false); }
  }
  return <View style={styles.form}>
    <Heading level={2} style={styles.title}>Confirma tu correo</Heading>
    <Text style={styles.note}>Introduce el código de confirmación para {email}. Si no lo tienes, solicita uno. Si ya confirmaste tu cuenta, vuelve e inicia sesión.</Text>
    <RecipeField label="Código de verificación" fieldId="registration-code" value={code} onChangeText={setCode}
      keyboardType="number-pad" autoComplete="one-time-code" textContentType="oneTimeCode" maxLength={10}
      autoCorrect={false} autoCapitalize="none" editable={!busy && !disabled} onSubmitEditing={() => void run(false)} />
    {error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
    {message !== '' && <Text accessibilityLiveRegion="polite" style={styles.note}>{message}</Text>}
    <Button label={busy ? 'Procesando…' : 'Verificar y entrar'} disabled={busy || disabled || !code.trim()} onPress={() => void run(false)} />
    <Button secondary label={remaining ? `Reenviar en ${remaining} s` : 'Reenviar código'} disabled={busy || disabled || remaining > 0} onPress={() => void run(true)} />
    <Button secondary label="Volver al acceso" disabled={busy} onPress={onBack} />
  </View>;
}
const useStyles = createThemedStyles(colors => StyleSheet.create({
  form: { gap: 12, maxWidth: 440, width: '100%' }, title: { color: colors.ink, fontSize: 20, fontWeight: '700' },
  note: { color: colors.muted, lineHeight: 22 }, error: { color: colors.danger, lineHeight: 22 },
}));
