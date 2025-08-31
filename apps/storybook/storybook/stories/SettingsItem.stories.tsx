import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { SettingsItem } from '@hum/ui-components';
import { Text } from 'react-native';

const meta: Meta<typeof SettingsItem> = {
  title: 'Components/SettingsItem',
  component: SettingsItem,
  args: {
    title: 'Account',
    subtitle: 'Manage your account',
  },
  argTypes: {
    onPress: { action: 'pressed' },
  },
};

export default meta;

export type Story = StoryObj<typeof SettingsItem>;

export const Basic: Story = {
  render: (args) => <SettingsItem {...args} icon={<Text>👤</Text>} />,
};

export const WithoutSubtitle: Story = {
  render: (args) => (
    <SettingsItem {...args} icon={<Text>👤</Text>} subtitle={undefined} />
  ),
};

export const CustomIcon: Story = {
  render: (args) => <SettingsItem {...args} icon={<Text>🔐</Text>} />,
};
