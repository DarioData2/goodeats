import { Platform, Text, type TextProps } from 'react-native';
import { typography } from '../constants/theme';

export function Heading({ level = 1, ...props }: TextProps & { level?: 1 | 2 | 3 }) {
  const web = Platform.OS === 'web' ? { 'aria-level': level } : {};
  return <Text {...props} style={[props.style, { fontFamily: typography.heading, fontWeight: 'normal' }]} accessibilityRole="header" {...web} />;
}
