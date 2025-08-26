import React, { useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { storiesOf } from '@storybook/react-native';
import { ThemeProvider, spacing, typography, useTheme } from '@mchat/ui-tokens';

const tokensStories = storiesOf('Tokens', module);

tokensStories.add('Basics', () => (
  <ThemeProvider>
    <View style={{ padding: spacing.lg }}>
      <Text style={{ fontSize: typography.fontSize.lg }}>Tokens Demo</Text>
    </View>
  </ThemeProvider>
));

const ThemeToggleContent = ({
  mode,
  onToggle,
}: {
  mode: 'light' | 'dark';
  onToggle: () => void;
}) => {
  const {
    colors,
    spacing: spacingTokens,
    typography: typographyTokens,
  } = useTheme();

  const containerStyle = {
    padding: spacingTokens.lg,
    backgroundColor: colors.surface,
  };

  const textStyle = {
    color: colors.text,
    fontSize: typographyTokens.fontSize.lg,
    marginBottom: spacingTokens.md,
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <Text style={textStyle}>Current theme: {mode}</Text>
      <Button title="Toggle Theme" color={colors.primary} onPress={onToggle} />
    </View>
  );
};

const ThemeToggleDemo = () => {
  const [mode, setMode] = useState<'light' | 'dark'>('light');
  const toggle = () => setMode((m) => (m === 'light' ? 'dark' : 'light'));
  return (
    <ThemeProvider mode={mode}>
      <ThemeToggleContent mode={mode} onToggle={toggle} />
    </ThemeProvider>
  );
};

tokensStories.add('Theme Toggle', () => <ThemeToggleDemo />);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
