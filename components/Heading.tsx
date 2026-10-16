import { Platform, Text, type TextProps } from 'react-native';

export function Heading({ level = 1, ...props }: TextProps & { level?: 1 | 2 | 3 }) {
  const web = Platform.OS === 'web' ? { 'aria-level': level } : {};
  return <Text {...props} accessibilityRole="header" {...web} />;
}
