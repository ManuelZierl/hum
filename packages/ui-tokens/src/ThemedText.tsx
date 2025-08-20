import React from 'react';
import { Text, TextProps } from 'react-native';
import { useTheme } from './ThemeProvider';

export const ThemedText: React.FC<TextProps> = ({ style, ...rest }) => {
  const { colors, typography } = useTheme();
  return (
    <Text
      {...rest}
      style={[{ color: colors.text, fontSize: typography.fontSize.md }, style]}
    />
  );
};
