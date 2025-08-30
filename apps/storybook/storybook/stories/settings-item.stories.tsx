import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { SettingsItem } from '@hum/ui-components';
import { User } from 'lucide-react-native';

const meta: Meta<typeof SettingsItem> = {
  title: 'Components/SettingsItem',
  component: SettingsItem,
  argTypes: {
    title: { control: 'text' },
    subtitle: { control: 'text' },
    onPress: { action: 'pressed' },
  },
  args: {
    title: 'Account',
    subtitle: 'Manage your account',
    icon: <User />,
  },
};

export default meta;

type Story = StoryObj<typeof SettingsItem>;

export const Basic: Story = {};
export const WithoutSubtitle: Story = {
  args: { subtitle: undefined },
};
export const CustomTitle: Story = {
  args: { title: 'Custom', subtitle: 'Custom subtitle' },
};
