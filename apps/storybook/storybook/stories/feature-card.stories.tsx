import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { FeatureCard } from '@hum/ui-components';
import { Text } from 'react-native';

const meta: Meta<typeof FeatureCard> = {
  title: 'Components/FeatureCard',
  component: FeatureCard,
  args: {
    icon: <Text>⚡</Text>,
    title: 'Lightning Wallet',
    description:
      'Manage your Lightning Bitcoin balance and make instant payments',
  },
};

export default meta;

type Story = StoryObj<typeof FeatureCard>;

export const Basic: Story = {};
export const Another: Story = {
  args: {
    title: 'Send & Receive',
    description: 'Scan QR codes or share payment links to send money instantly',
  },
};
