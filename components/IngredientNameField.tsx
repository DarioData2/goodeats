import { useState } from 'react';
import { Pressable, StyleSheet, Text, View, type TextInputProps } from 'react-native';
import { createThemedStyles } from '../contexts/ThemeContext';
import { ui } from '../constants/theme';
import { ingredientSuggestions } from '../services/ingredientSuggestions';
import { IngredientIcon } from './IngredientIcon';
import { RecipeField } from './RecipeField';

type Props = TextInputProps & { label: string; fieldId: string; error?: string; focusSignal?: object };
export function IngredientNameField(props: Props) {
  const { styles } = useStyles();
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestions = showSuggestions && props.editable !== false ? ingredientSuggestions(props.value ?? '') : [];
  function choose(name: string) {
    props.onChangeText?.(name);
    setShowSuggestions(false);
  }
  return <View style={styles.field}>
    <RecipeField {...props} onChangeText={text => { props.onChangeText?.(text); setShowSuggestions(true); }}
      onKeyPress={event => { if (event.nativeEvent.key === 'Escape') setShowSuggestions(false); props.onKeyPress?.(event); }} />
    {suggestions.length > 0 && <View style={styles.suggestions}>
      <Text style={styles.hint}>Sugerencias · selecciona una o conserva tu texto</Text>
      {suggestions.map(name => <Pressable key={name} accessibilityRole="button" accessibilityLabel={`Usar ${name}`}
        onPress={() => choose(name)} style={({ pressed }) => [styles.option, pressed && styles.pressed]}>
        <IngredientIcon name={name} /><Text style={styles.name}>{name}</Text>
      </Pressable>)}
      <Pressable accessibilityRole="button" onPress={() => setShowSuggestions(false)} style={styles.option}>
        <Text style={styles.keep}>Mantener «{props.value}»</Text>
      </Pressable>
    </View>}
  </View>;
}
const useStyles = createThemedStyles(colors => StyleSheet.create({
  field: { gap: 6 }, suggestions: { borderWidth: 1, borderColor: colors.border, borderRadius: ui.radius.control, overflow: 'hidden', backgroundColor: colors.surface },
  hint: { color: colors.muted, fontSize: 12, padding: 10 },
  option: { minHeight: 44, paddingHorizontal: 12, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', gap: 8, borderTopWidth: 1, borderTopColor: colors.border },
  pressed: { backgroundColor: colors.primarySoft }, name: { color: colors.ink, fontSize: 16, flexShrink: 1 },
  keep: { color: colors.primaryDark, fontSize: 14, flexShrink: 1 },
}));
