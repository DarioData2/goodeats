import { useState } from 'react';
import { Link } from 'expo-router';
import { randomUUID } from 'expo-crypto';
import { StyleSheet, Text, View } from 'react-native';
import { colors, ui } from '../constants/theme';
import { parseVideoUrl, validateVideoBookmark, validateVideoSource, type VideoBookmark, type VideoSource } from '../services/videoRecipes';
import { Button } from './Button';
import { Heading } from './Heading';
import { RecipeField } from './RecipeField';

export function VideoSourceLink({ source }: { source: VideoSource }) {
  const safe = validateVideoSource(source);
  return <View style={styles.stack}>
    <Text style={styles.hint}>Fuente: {safe.platform}{safe.author ? ` · ${safe.author}` : ''}</Text>
    <Link href={safe.url} target="_blank" rel="noopener noreferrer" style={styles.link}>Abrir video en {safe.platform} ↗</Link>
  </View>;
}

export function VideoImport({ busy, onSave, onCancel }: { busy: boolean; onSave: (bookmark: VideoBookmark) => Promise<void>; onCancel: () => void }) {
  const [id] = useState(randomUUID);
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [source, setSource] = useState<VideoSource | null>(null);
  const [error, setError] = useState('');
  const [focus, setFocus] = useState<object>();
  function preview() {
    try { setSource(parseVideoUrl(url)); setError(''); }
    catch (issue) { setSource(null); setError((issue as Error).message); setFocus({}); }
  }
  async function save() {
    if (!source) return;
    try { await onSave(validateVideoBookmark({ id, title: title.trim() || `Video de ${source.platform}`, source: { ...source, author } })); }
    catch (issue) { setError((issue as Error).message); }
  }
  return <View style={styles.card}>
    <Heading level={2} style={styles.title}>Importar desde video</Heading>
    <Text style={styles.hint}>Guarda un enlace de YouTube o TikTok y completa la receta cuando quieras. Esta versión no extrae texto, imágenes ni ingredientes del video.</Text>
    <RecipeField fieldId={`video-${id}`} label="Enlace del video" placeholder="https://…" keyboardType="url" autoCapitalize="none" autoCorrect={false} value={url} editable={!busy} onChangeText={value => { setUrl(value); setSource(null); setError(''); }} maxLength={2048} error={error} focusSignal={focus} />
    <Button label="Revisar enlace" secondary disabled={busy} onPress={preview} />
    {source && <>
      <Text accessibilityLiveRegion="polite" style={styles.label}>{source.platform} · enlace reconocido</Text>
      <Text style={styles.hint}>No hemos comprobado si el video existe o es público.</Text>
      <VideoSourceLink source={source} />
      <RecipeField fieldId={`video-title-${id}`} label="Nombre del plato o video (opcional)" value={title} onChangeText={setTitle} editable={!busy} maxLength={120} />
      <RecipeField fieldId={`video-author-${id}`} label="Autor o canal (opcional)" value={author} onChangeText={setAuthor} editable={!busy} maxLength={120} />
      <Button label={busy ? 'Guardando…' : 'Guardar enlace pendiente'} disabled={busy} onPress={() => void save()} />
    </>}
    <Button label="Cancelar importación" secondary disabled={busy} onPress={onCancel} />
  </View>;
}
const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: ui.radius.card, borderWidth: 1, borderColor: colors.border, padding: 18, gap: 16 },
  stack: { gap: 8 }, title: { fontSize: 20, fontWeight: '700', color: colors.ink }, label: { fontSize: 16, fontWeight: '700', color: colors.ink },
  hint: { fontSize: 14, lineHeight: 21, color: colors.muted }, link: { color: colors.primary, fontSize: 16, lineHeight: 24, paddingVertical: 12, textDecorationLine: 'underline' },
});
