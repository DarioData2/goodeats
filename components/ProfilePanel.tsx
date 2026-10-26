import { useRef, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { Image, StyleSheet, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { randomUUID } from 'expo-crypto';
import { useAccount } from '../contexts/AuthContext';
import { profileNames, validateProfileNames, validateAvatar } from '../services/profileLogic';
import { readProfile, saveProfile, type AvatarChange } from '../services/profileService';
import { colors } from '../constants/theme';
import { Button } from './Button';
import { Heading } from './Heading';
import { RecipeField } from './RecipeField';

export function ProfilePanel({ user, disabled, onBusyChange }: { user: User; disabled: boolean; onBusyChange: (busy: boolean) => void }) {
  const { avatarUrl, applyUser } = useAccount();
  const names = profileNames(user.user_metadata);
  const [editing, setEditing] = useState(false);
  const [firstName, setFirstName] = useState(names.firstName);
  const [lastName, setLastName] = useState(names.lastName);
  const [avatar, setAvatar] = useState<AvatarChange>(undefined);
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [focusRequest, setFocusRequest] = useState<{ field: 'firstName' | 'lastName' }>();
  const lock = useRef(false);
  const photo = avatar === undefined ? avatarUrl : preview;
  function progress(value: boolean) { setBusy(value); onBusyChange(value); }
  async function edit() {
    if (lock.current || disabled) return;
    lock.current = true; progress(true); setError(''); setMessage('');
    try {
      const latest = await readProfile(user.id);
      const saved = profileNames(latest.user_metadata);
      applyUser(latest);
      setFirstName(saved.firstName); setLastName(saved.lastName);
      setAvatar(undefined); setPreview(null); setFocusRequest(undefined); setEditing(true);
    } catch (issue) { setError(issue instanceof Error ? issue.message : 'No pudimos cargar tu perfil.'); }
    finally { lock.current = false; progress(false); }
  }
  async function choosePhoto() {
    if (lock.current || disabled) return;
    // Launch directly from the gesture; awaiting work first blocks web file pickers.
    const selection = ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: false, quality: 1 });
    try {
      const result = await selection;
      if (result.canceled || !result.assets[0]) return;
      lock.current = true; progress(true); setError('');
      const asset = result.assets[0];
      if ((asset.fileSize ?? 0) > 10 * 1024 * 1024 || asset.width <= 0 || asset.height <= 0) throw new Error('Elige una imagen de hasta 10 MB.');
      const side = Math.min(asset.width, asset.height);
      const context = ImageManipulator.manipulate(asset.uri);
      context.crop({ originX: Math.floor((asset.width - side) / 2), originY: Math.floor((asset.height - side) / 2), width: side, height: side });
      context.resize({ width: 256, height: 256 });
      const rendered = await context.renderAsync();
      const image = await rendered.saveAsync({ format: SaveFormat.JPEG, compress: 0.8, base64: true });
      if (!image.base64) throw new Error('No pudimos preparar esta imagen. Prueba con otra.');
      const bytes = Uint8Array.from(atob(image.base64), char => char.charCodeAt(0)).buffer;
      validateAvatar(bytes);
      setAvatar({ bytes, filename: `${randomUUID()}.jpg` }); setPreview(`data:image/jpeg;base64,${image.base64}`);
    } catch (issue) { setError(issue instanceof Error ? issue.message : 'No pudimos abrir la imagen.'); }
    finally { lock.current = false; progress(false); }
  }
  async function save() {
    if (lock.current || disabled) return;
    lock.current = true; progress(true); setError(''); setMessage('');
    try {
      const saved = await saveProfile(user.id, validateProfileNames({ firstName, lastName }), avatar);
      applyUser(saved);
      const confirmedNames = profileNames(saved.user_metadata);
      setFirstName(confirmedNames.firstName); setLastName(confirmedNames.lastName);
      setEditing(false); setAvatar(undefined); setPreview(null);
      setMessage(avatar ? 'Foto y perfil guardados correctamente.' : avatar === null ? 'Foto eliminada y perfil guardado correctamente.' : 'Perfil guardado correctamente.');
    } catch (issue) {
      setError(issue instanceof Error ? issue.message : 'No pudimos guardar el perfil.');
      if (!firstName.trim()) setFocusRequest({ field: 'firstName' });
      else if (!lastName.trim()) setFocusRequest({ field: 'lastName' });
    }
    finally { lock.current = false; progress(false); }
  }
  return <View style={styles.stack}>
    {!!message && <View accessibilityRole="alert" style={styles.success}><Text style={styles.successText}>✓ {message}</Text></View>}
    {!!error && <View accessibilityRole="alert" style={styles.failure}><Text style={styles.error}>{error}</Text></View>}
    <View style={styles.identity}>
      {photo ? <Image source={{ uri: photo }} accessibilityLabel="Foto de perfil" style={styles.photo} /> : <View style={[styles.photo, styles.placeholder]}><Text style={styles.initials}>{`${names.firstName.charAt(0)}${names.lastName.charAt(0)}`.toLocaleUpperCase('es') || '?'}</Text></View>}
      <View style={styles.copy}><Heading level={2} style={styles.name}>{[names.firstName, names.lastName].filter(Boolean).join(' ') || 'Completa tu perfil'}</Heading><Text style={styles.note}>{user.email}</Text></View>
    </View>
    {editing ? <>
      <Heading level={3} style={styles.name}>Editar perfil</Heading>
      <Text style={styles.note}>Completa nombre y apellido para guardar el perfil y la foto.</Text>
      <RecipeField fieldId="profile-first-name" label="Nombre" value={firstName} onChangeText={setFirstName} maxLength={80} autoComplete="given-name" editable={!busy} focusSignal={focusRequest?.field === 'firstName' ? focusRequest : undefined} />
      <RecipeField fieldId="profile-last-name" label="Apellido" value={lastName} onChangeText={setLastName} maxLength={80} autoComplete="family-name" editable={!busy} focusSignal={focusRequest?.field === 'lastName' ? focusRequest : undefined} />
      <Text style={styles.note}>La foto se recortará al centro. Se subirá a tu cuenta solo al guardar.</Text>
      <Button label={photo ? 'Cambiar foto' : 'Agregar foto'} secondary disabled={busy || disabled} onPress={() => void choosePhoto()} />
      {!!photo && <Button label="Quitar foto" secondary disabled={busy || disabled} onPress={() => { setAvatar(null); setPreview(null); }} />}
      <Button label={busy ? 'Guardando…' : 'Guardar perfil'} disabled={busy || disabled} onPress={() => void save()} />
      <Button label="Cancelar edición del perfil" secondary disabled={busy} onPress={() => { setEditing(false); setAvatar(undefined); setPreview(null); setError(''); }} />
    </> : <Button label={busy ? 'Cargando perfil…' : 'Editar perfil'} secondary disabled={disabled || busy} onPress={() => void edit()} />}
  </View>;
}
const styles = StyleSheet.create({
  stack: { gap: 14 }, identity: { flexDirection: 'row', alignItems: 'center', gap: 14 }, copy: { flex: 1, minWidth: 0 },
  photo: { width: 72, height: 72, borderRadius: 36 }, placeholder: { backgroundColor: colors.accentSoft, justifyContent: 'center', alignItems: 'center' },
  initials: { fontSize: 24, fontWeight: '700', color: colors.accentText }, name: { fontSize: 18, fontWeight: '700', color: colors.ink },
  note: { color: colors.muted, lineHeight: 21 }, error: { color: colors.danger, lineHeight: 22 },
  success: { padding: 14, borderRadius: 12, backgroundColor: colors.primarySoft, borderWidth: 1, borderColor: colors.primary },
  successText: { color: colors.primaryDark, fontWeight: '700', lineHeight: 22 },
  failure: { padding: 14, borderRadius: 12, backgroundColor: colors.errorBackground, borderWidth: 1, borderColor: colors.danger },
});
