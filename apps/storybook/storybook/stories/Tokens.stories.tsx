import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { ThemeProvider, useTheme } from '@mchat/ui-tokens';
import { View, Text } from 'react-native';

const TokensDemo: React.FC = () => {
  const { colors, spacing, typography } = useTheme();
  return (
    <View style={{ padding: spacing.lg, backgroundColor: colors.surface }}>
      <Text style={{ color: colors.text, fontSize: typography.fontSize.lg }}>
        Tokens Demo
      </Text>
    </View>
  );
};

const meta: Meta<typeof TokensDemo> = {
  title: 'Tokens/Overview',
  component: TokensDemo,
};
export default meta;

type Story = StoryObj<typeof TokensDemo>;

export const Basic: Story = {
  render: () => (
    <ThemeProvider>
      <TokensDemo />
    </ThemeProvider>
  ),
};
