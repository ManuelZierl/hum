import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { View, Text } from 'react-native';
import { ThemeProvider, useTheme } from '@hum/ui-tokens';

const Demo: React.FC = () => {
  const { colors, spacing, typography } = useTheme();
  return (
    <View style={{ padding: spacing.lg, backgroundColor: colors.surface }}>
      <Text style={{ color: colors.text, fontSize: typography.fontSize.lg }}>
        Tokens Demo
      </Text>
    </View>
  );
};

const meta: Meta<typeof Demo> = {
  title: 'Tokens/Basic',
  component: Demo,
};
export default meta;

type Story = StoryObj<typeof Demo>;

export const Basic: Story = {
  render: () => (
    <ThemeProvider>
      <Demo />
    </ThemeProvider>
  ),
};
