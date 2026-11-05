import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { createThemedStyles } from '../contexts/ThemeContext';
import { ingredientIconKind, type IngredientIconKind } from '../services/ingredientIcons';

const paths: Record<IngredientIconKind, string> = {
  tomato: 'M12 8C7 5 3 8 3 13a9 8 0 0 0 18 0c0-5-4-8-9-5ZM12 9V3m-4 3 4 3 4-3',
  carrot: 'm15 8 3 3C14 17 6 21 3 21c0-3 4-11 10-15Zm0-2 1-4m2 5 4-1m-4 3 3 3M8 12l3 2m-6 2 2 1',
  leaf: 'M20 3C6 2 1 10 5 17s15 3 15-14ZM5 20 17 7m-8 9v-5m4 1h4',
  fruit: 'M12 8C4 2 1 12 6 19c2 3 4 1 6 1s4 2 6-1c5-7 2-17-6-11ZM12 8V4m0 1c2-4 6-3 6-3-1 4-4 4-6 3',
  milk: 'M6 7 9 3h6l3 4v14H6V7Zm0 0h12M9 3v4m-1 5h8v5H8Z',
  egg: 'M20 14c0 5-3.5 7-8 7s-8-2-8-7S9 2 12 2s8 7 8 12Z',
  cheese: 'm3 10 13-7 5 7v11H3V10Zm0 0h18M8 14h.1M14 18h.1m3-5h.1',
  bread: 'M5 21V11C1 9 3 3 7 4c2-3 8-3 10 0 4-1 6 5 2 7v10H5Zm3-8h8m-8 4h8',
  meat: 'M9 4c5-3 14 1 12 8-1 4-6 3-8 5-2 1-1 4-4 4-4 0-9-6-7-10 1-2 4-2 4-4 0-1 1-2 3-3Zm3 4c2-2 6 0 5 3s-5 2-5-3Z',
  fish: 'M17 8C11 1 4 7 2 12c2 5 9 11 15 4l5 4V4l-5 4Zm0 0c-3 2-3 6 0 8M7 11h.1',
  grain: 'M12 22V3m0 6C6 9 5 4 5 4c5-1 7 2 7 5Zm0 6c-6 0-7-5-7-5 5-1 7 2 7 5Zm0 5c-6 0-7-5-7-5 5-1 7 2 7 5Zm0-13c6 0 7-5 7-5-5-1-7 2-7 5Zm0 6c6 0 7-5 7-5-5-1-7 2-7 5Z',
  bean: 'M7 3c-8 4-4 18 4 18 9 0 13-9 8-12-4-2-4 3-7 2-2-1 2-7-2-8H7Zm2 4c-3 3-2 9 2 10',
  onion: 'M12 7C8 10 3 10 3 15a9 6 0 0 0 18 0c0-5-5-5-9-8Zm0 0V2m0 5L8 3m4 4 4-4m-4 6c-5 6-4 10 0 12 4-2 5-6 0-12Z',
};

export function IngredientIcon({ name }: { name: string }) {
  const { colors, styles } = useStyles();
  const kind = ingredientIconKind(name);
  if (!kind) return null;
  return <View accessible={false} aria-hidden={true} style={styles.icon}>
    <Svg width={19} height={19} viewBox="0 0 24 24" fill="none" stroke={colors.accentText} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <Path d={paths[kind]} />
      {kind === 'egg' && <Circle cx={12} cy={15} r={3} />}
    </Svg>
  </View>;
}
const useStyles = createThemedStyles(colors => StyleSheet.create({
  icon: { width: 28, height: 28, borderRadius: 8, backgroundColor: colors.accentSoft, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
}));
