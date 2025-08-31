import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { FeatureCard } from '@hum/ui-components';
import { Text } from 'react-native';
import { useTheme, ThemeProvider } from '@hum/ui-components';

const WalletIcon = () => {
  const { colors, type } = useTheme();
  return (
    <Text
      style={{ color: colors.humPrimaryForeground, fontSize: type.size.lg }}
    >
      💼
    </Text>
  );
};

const ZapIcon = () => {
  const { colors, type } = useTheme();
  return (
    <Text
      style={{ color: colors.humPrimaryForeground, fontSize: type.size.lg }}
    >
      ⚡️
    </Text>
  );
};

const meta: Meta<typeof FeatureCard> = {
  title: 'Components/FeatureCard',
  component: FeatureCard,
  args: {
    title: 'Lightning Wallet',
    description: 'Manage your balance and make payments',
  },
};

export default meta;

export type Story = StoryObj<typeof FeatureCard>;

export const Basic: Story = {
  render: (args) => <FeatureCard {...args} icon={<WalletIcon />} />,
};

export const ZapFeature: Story = {
  render: (args) => <FeatureCard {...args} icon={<ZapIcon />} />,
  args: {
    title: 'Instant Settlements',
    description: 'Settle payments in milliseconds',
  },
};

export const DarkMode: Story = {
  decorators: [
    (StoryFn) => (
      <ThemeProvider forcedScheme="dark">
        <StoryFn />
      </ThemeProvider>
    ),
  ],
  render: (args) => <FeatureCard {...args} icon={<WalletIcon />} />,
};
