import { View, type ViewProps } from 'react-native';
import { useColorScheme } from 'react-native';

import { Colors } from '@/constants/Colors';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export function ThemedView({ style, lightColor, darkColor, ...otherProps }: ThemedViewProps) {
  const theme = useColorScheme() ?? 'light';
  const backgroundColor = theme === 'dark' ? darkColor : lightColor;

  return (
    <View
      style={[{ backgroundColor: backgroundColor ?? Colors[theme].background }, style]}
      {...otherProps}
    />
  );
}
