import Svg, { Circle, Path } from 'react-native-svg';

export function MealIcon({ color }: { color: string }) {
  return <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={color}
    strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
    <Circle cx={12} cy={12} r={6} />
    <Circle cx={12} cy={12} r={3.5} />
    <Path d="M2 3v5c0 2 3 2 3 0V3M3.5 3v18M22 21V3c-3 2-3 9 0 9" />
  </Svg>;
}
